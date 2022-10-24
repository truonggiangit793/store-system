const bcrypt = require('bcrypt');
const validator = require('email-validator');
const jwt = require('jsonwebtoken');
const xlsxFile = require('read-excel-file/node');
const phoneNumberValidator = require('validate-phone-number-node-js');

const accountModel = require('../../models/account');

module.exports = {
    login: async (req, res, next) => {
        const userCode = req.body.userCode
            ? req.body.userCode.toUpperCase()
            : null;
        const password = req.body.password;
        if (!userCode)
            return res.json({
                status: false,
                msg: { en: 'User account is required!' },
            });
        if (!password)
            return res.json({
                status: false,
                msg: { en: 'Password is required!' },
            });
        const accountQuery = await accountModel.findOne({ userCode });
        if (!accountQuery)
            return res.json({
                status: false,
                msg: { en: 'Account does not exist!' },
            });
        const validPassword = bcrypt.compareSync(
            password,
            accountQuery.password,
        );
        if (!validPassword)
            return res.json({
                status: false,
                msg: { en: 'Invalid password!' },
            });
        const jwtSignature = jwt.sign(
            {
                // Set the expiration upto 30 days
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
                data: {
                    userCode: accountQuery.userCode,
                    role: accountQuery.role,
                    fullname: `${accountQuery.fullName}`,
                },
            },
            process.env.SECRET_KEY,
        );
        accountQuery.access_token = jwtSignature;
        return res.json({
            status: true,
            msg: { en: 'Login successfully!' },
            token: jwtSignature,
        });
    },
    importAccount: async (req, res, next) => {
        const token = req.query.token || req.headers['x-access-token'];
        if (!req.file)
            return res.json({
                status: false,
                msg: { en: 'Excel file data is required!' },
            });
        const rows = await xlsxFile(req.file.path);
        const invalidFormat =
            rows[0][0].toUpperCase() !== 'USER CODE' ||
            rows[0][1].toUpperCase() !== 'FULLNAME' ||
            rows[0][2].toUpperCase() !== 'EMAIL' ||
            rows[0][3].toUpperCase() !== 'PHONE NUMBER' ||
            rows[0][4].toUpperCase() !== 'PASSWORD' ||
            rows[0][5].toUpperCase() !== 'ROLE';
        if (invalidFormat)
            return res.json({
                status: false,
                msg: { en: `Invalid format excel file!` },
            });

        rows.forEach((element, index) => {
            if (index > 0) {
                if (!element[4])
                    return res.json({
                        status: false,
                        msg: {
                            en: `${
                                element[1]
                            } need to be set password. At row ${
                                index + 1
                            } in excel file!`,
                        },
                    });
                let query = { userCode: element[0].toUpperCase() };
                let update = {
                    userCode: element[0],
                    fullName: element[1],
                    email: element[2],
                    phoneNumber: element[3] ? element[3] : 'Unknown',
                    password: bcrypt.hashSync(
                        element[4],
                        bcrypt.genSaltSync(10),
                    ),
                    role: element[5] ? element[5].toUpperCase() : 'STAFF',
                };
                let options = {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                };
                accountModel.findOneAndUpdate(
                    query,
                    update,
                    options,
                    function (error, result) {
                        if (error) {
                            return res.json({
                                status: false,
                                msg: {
                                    en: 'Failed! An error occured, please try again!',
                                },
                            });
                        } else {
                            // If the document doesn't exist
                            result = !result ? new accountModel() : result;
                            // Save the document
                            result.save();
                        }
                    },
                );
            }
        });
        return res.json({
            status: true,
            msg: { en: 'Account data synced success!' },
        });
    },
    registerAccount: async (req, res, next) => {
        const token = req.query.token || req.headers['x-access-token'];
        const userCode = req.body.userCode
            ? req.body.userCode.toUpperCase()
            : null;
        const fullName = req.body.fullName || null;
        const email = req.body.email || null;
        const phoneNumber = req.body.phoneNumber || null;
        const password = req.body.password;
        const role = req.body.role || null;
        if (!userCode)
            return res.json({
                status: false,
                msg: { en: 'User account is required!' },
            });
        if (!fullName)
            return res.json({
                status: false,
                msg: { en: 'Fullname is required!' },
            });
        if (!email || !validator.validate(email))
            return res.json({
                status: false,
                msg: { en: 'Email is required and must be a valid email!' },
            });
        if (!phoneNumber || !phoneNumberValidator.validate(phoneNumber))
            return res.json({
                status: false,
                msg: {
                    en: 'Phone number is required and must be a valid phone number!',
                },
            });
        if (!password || password.length < 6)
            return res.json({
                status: false,
                msg: {
                    en: 'Password is required and must be at least 6 characters!',
                },
            });
        const validRole =
            role.toUpperCase() == 'MANAGER' || role.toUpperCase() == 'STAFF';
        if (!role || !validRole)
            return res.json({
                status: false,
                msg: { en: 'Role is required and must be a valid role!' },
            });
        const accountQuery = await accountModel.findOne({ userCode });
        if (accountQuery)
            return res.json({
                status: false,
                msg: { en: 'Account has been already existed!' },
            });
        const newUser = new accountModel({
            userCode,
            fullName,
            email,
            phoneNumber,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
            role: role.toUpperCase(),
        });
        newUser.save();
        return res.json({
            status: true,
            msg: { en: 'Created a new account!' },
            data: newUser,
        });
    },
    disableAccount: async (req, res, next) => {
        const token = req.query.token || req.headers['x-access-token'];
        const userCode = req.query.userCode
            ? req.query.userCode.toUpperCase()
            : null;
        if (!userCode)
            return res.json({
                status: false,
                msg: { en: 'User account is required!' },
            });
        if (userCode.toUpperCase() == 'ADMINISTRATOR')
            return res.json({
                status: false,
                msg: { en: 'Permission denied! This is ADMIN account!' },
            });
        const accountQuery = await accountModel.findOne({
            userCode: userCode.toUpperCase(),
        });
        if (!accountQuery)
            return res.json({
                status: false,
                msg: { en: 'This account does not exist!' },
            });
        let query = { userCode: userCode.toUpperCase() };
        let options = { upsert: true, new: true, setDefaultsOnInsert: true };
        accountModel.findOneAndUpdate(
            query,
            { deleted: true },
            options,
            function (error, result) {
                if (error) {
                    return res.json({
                        status: false,
                        msg: {
                            en: 'Failed! An error occured, please try again!',
                        },
                    });
                } else {
                    // If the document doesn't exist
                    result = !result ? new accountModel() : result;
                    // Save the document
                    result.save();
                }
            },
        );
        return res.json({
            status: true,
            msg: { en: 'Account has been disabled!' },
        });
    },
    getProfile: async (req, res, next) => {
        const token = req.query.token || req.headers['x-access-token'];
        const payload = await jwt.verify(token, process.env.SECRET_KEY);
        const userCode = payload.data.userCode;
        const accountQuery = await accountModel.findOne({ userCode });
        return res.json({
            status: true,
            msg: { en: 'successfully' },
            data: {
                email: accountQuery.email,
                fullName: accountQuery.fullName,
                userCode: accountQuery.userCode,
                phoneNumer: accountQuery.phoneNumer,
                lastLogin: accountQuery.lastLogin,
                role: accountQuery.role,
                createdAt: accountQuery.createdAt,
                updatedAt: accountQuery.updatedAt,
            },
        });
    },
    accountGetAll: async (req, res, next) => {
        const token = req.query.token || req.headers['x-access-token'];
        const accountList = await accountModel.find({});
        if (accountList.length > 0) {
            return res.json({
                status: true,
                message: 'Get list of all accounts.',
                result: {
                    total: accountList.length,
                    data: accountList.length > 0 ? accountList : [],
                },
            });
        } else {
            return res.json({
                status: false,
                message: 'There is no data!',
            });
        }
    },
};
