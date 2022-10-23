const Router = require("express").Router();
const bcrypt = require("bcrypt");
const excel = require("excel4node");
const workbook = new excel.Workbook();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const mime = require("mime");
const xlsxFile = require("read-excel-file/node");
const { v4 } = require("uuid");
const validator = require("email-validator");
const phoneNumberValidator = require("validate-phone-number-node-js");

const accountModel = require("../models/account");
const supplierModel = require("../models/supplier");
const productModel = require("../models/product");

const authorization = require("../middlewares/authorization");
const multer = require("../services/multer");

Router.post("/login", async (req, res, next) => {
    const userCode = req.body.userCode ? req.body.userCode.toUpperCase() : null;
    const password = req.body.password;
    if (!userCode) return res.json({ status: false, msg: { en: "User account is required!" } });
    if (!password) return res.json({ status: false, msg: { en: "Password is required!" } });
    const accountQuery = await accountModel.findOne({ userCode });
    if (!accountQuery) return res.json({ status: false, msg: { en: "Account does not exist!" } });
    const validPassword = bcrypt.compareSync(password, accountQuery.password);
    if (!validPassword) return res.json({ status: false, msg: { en: "Invalid password!" } });
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
        process.env.SECRET_KEY
    );
    accountQuery.access_token = jwtSignature;
    return res.json({ status: true, msg: { en: "Login successfully!" }, token: jwtSignature });
});

Router.post(
    "/account/import",
    authorization.admin,
    multer.accountImport,
    async (req, res, next) => {
        if (!req.file)
            return res.json({ status: false, msg: { en: "Excel file data is required!" } });
        const rows = await xlsxFile(req.file.path);
        const invalidFormat =
            rows[0][0].toUpperCase() !== "USER CODE" ||
            rows[0][1].toUpperCase() !== "FULLNAME" ||
            rows[0][2].toUpperCase() !== "EMAIL" ||
            rows[0][3].toUpperCase() !== "PHONE NUMBER" ||
            rows[0][4].toUpperCase() !== "PASSWORD" ||
            rows[0][5].toUpperCase() !== "ROLE";
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
                            en: `${element[1]} need to be set password. At row ${
                                index + 1
                            } in excel file!`,
                        },
                    });
                let query = { userCode: element[0].toUpperCase() };
                let update = {
                    userCode: element[0],
                    fullName: element[1],
                    email: element[2],
                    phoneNumber: element[3],
                    password: bcrypt.hashSync(element[4], bcrypt.genSaltSync(10)),
                    role: element[5],
                };
                let options = { upsert: true, new: true, setDefaultsOnInsert: true };
                accountModel.findOneAndUpdate(query, update, options, function (error, result) {
                    if (error) {
                        return res.json({
                            status: false,
                            msg: { en: "Failed! An error occured, please try again!" },
                        });
                    } else {
                        // If the document doesn't exist
                        result = !result ? new accountModel() : result;
                        // Save the document
                        result.save();
                    }
                });
            }
        });
        return res.json({ status: true, msg: { en: "Account data synced success!" } });
    }
);

Router.post("/account/register", authorization.admin, async (req, res, next) => {
    const userCode = req.body.userCode ? req.body.userCode.toUpperCase() : null;
    const fullName = req.body.fullName || null;
    const email = req.body.email || null;
    const phoneNumber = req.body.phoneNumber || null;
    const password = req.body.password;
    const role = req.body.role || null;
    if (!userCode) return res.json({ status: false, msg: { en: "User account is required!" } });
    if (!fullName) return res.json({ status: false, msg: { en: "Fullname is required!" } });
    if (!email || !validator.validate(email))
        return res.json({
            status: false,
            msg: { en: "Email is required and must be a valid email!" },
        });
    if (!phoneNumber || !phoneNumberValidator.validate(phoneNumber))
        return res.json({
            status: false,
            msg: { en: "Phone number is required and must be a valid phone number!" },
        });
    if (!password || password.length < 6)
        return res.json({
            status: false,
            msg: { en: "Password is required and must be at least 6 characters!" },
        });
    const validRole = role == "manager" || role == "staff";
    if (!role || !validRole)
        return res.json({
            status: false,
            msg: { en: "Role is required and must be a valid role!" },
        });
    const accountQuery = await accountModel.findOne({ userCode });
    if (accountQuery)
        return res.json({ status: false, msg: { en: "Account has been already existed!" } });
    const newUser = new accountModel({
        userCode,
        fullName,
        email,
        phoneNumber,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        role,
    });
    newUser.save();
    return res.json({ status: true, msg: { en: "Created a new account!" }, data: newUser });
});

Router.post(
    "/supplier/import",
    authorization.admin,
    multer.supplierImport,
    async (req, res, next) => {
        if (!req.file)
            return res.json({ status: false, msg: { en: "Excel file data is required!" } });
        const rows = await xlsxFile(req.file.path);
        const invalidFormat =
            rows[0][0].toUpperCase() !== "SUPPLIER CODE" ||
            rows[0][1].toUpperCase() !== "SUPPLIER NAME" ||
            rows[0][2].toUpperCase() !== "ADDRESS" ||
            rows[0][3].toUpperCase() !== "PHONE NUMBER";
        if (invalidFormat)
            return res.json({
                status: false,
                msg: { en: `Invalid format excel file!` },
            });

        rows.forEach((element, index) => {
            if (index > 0) {
                let query = { supplierCode: element[0] };
                let options = { upsert: true, new: true, setDefaultsOnInsert: true };
                let update = {
                    supplierCode: element[0].toUpperCase(),
                    supplierName: element[1].toUpperCase(),
                    address: element[2],
                    phoneNumber: element[3],
                };
                supplierModel.findOneAndUpdate(query, update, options, function (error, result) {
                    if (error) {
                        return res.json({
                            status: false,
                            msg: { en: "Failed! An error occured, please try again!" },
                        });
                    } else {
                        // If the document doesn't exist
                        result = !result ? new supplierModel() : result;
                        // Save the document
                        result.save();
                    }
                });
            }
        });
        return res.json({ status: true, msg: { en: "Supplier data synced success!" } });
    }
);

Router.post("/supplier/register", authorization.admin, async (req, res, next) => {
    const supplierCode = req.body.supplierCode ? req.body.supplierCode.toUpperCase() : null;
    const supplierName = req.body.supplierName || null;
    const address = req.body.address || null;
    const phoneNumber = req.body.phoneNumber || null;
    if (!supplierCode)
        return res.json({ status: false, msg: { en: "Supplier code is required!" } });
    if (!supplierName)
        return res.json({ status: false, msg: { en: "Supplier name is required!" } });
    if (!address) return res.json({ status: false, msg: { en: "Address is required!" } });
    if (!phoneNumber || !phoneNumberValidator.validate(phoneNumber))
        return res.json({
            status: false,
            msg: { en: "Phone number is required and must be a valid phone number!" },
        });
    const supplierQuery = await supplierModel.findOne({ supplierCode });
    if (supplierQuery)
        return res.json({ status: false, msg: { en: "Supplier code has been already existed!" } });
    const supplier = new supplierModel({ supplierCode, supplierName, address, phoneNumber });
    supplier.save();
    return res.json({ status: true, msg: { en: "Created a new supplier!" }, data: supplier });
});

Router.post(
    "/products/import",
    authorization.admin,
    multer.productImport,
    async (req, res, next) => {
        if (!req.file)
            return res.json({ status: false, msg: { en: "Excel file data is required!" } });
        const rows = await xlsxFile(req.file.path);
        const invalidFormat =
            rows[0][0].toUpperCase() !== "BARCODE" ||
            rows[0][1].toUpperCase() !== "PRODUCT NAME" ||
            rows[0][2].toUpperCase() !== "UOM" ||
            rows[0][3].toUpperCase() !== "DEPARTMENT" ||
            rows[0][4].toUpperCase() !== "SUPPLIER CODE" ||
            rows[0][5].toUpperCase() !== "PRICE";

        if (invalidFormat)
            return res.json({
                status: false,
                msg: { en: `Invalid format excel file!` },
            });

        rows.forEach(async (element, index) => {
            if (index > 0) {
                let query = { barcode: element[0] };
                let supplier = await supplierModel.findOne({ supplierCode: element[4] });
                let update = {
                    barcode: element[0].toUpperCase(),
                    productName: element[1].toUpperCase(),
                    unitOfMeasure: element[2].toUpperCase(),
                    department: element[3].toUpperCase(),
                    supplierCode: element[4].toUpperCase(),
                    supplierName: supplier ? supplier.supplierName : "Unknown",
                    inMoney: element[5],
                };
                let options = { upsert: true, new: true, setDefaultsOnInsert: true };
                productModel.findOneAndUpdate(query, update, options, function (error, result) {
                    if (!error) {
                        // If the document doesn't exist
                        result = !result ? new productModel() : result;
                        // Save the document
                        result.save();
                    }
                });
            }
        });
        return res.json({ status: true, msg: { en: "Master products data synced success!" } });
    }
);

Router.post("/products/register", authorization.admin, async (req, res, next) => {
    const barcode = req.body.barcode ? req.body.barcode.toUpperCase() : null;
    const productName = req.body.productName || null;
    const UOM = req.body.UOM || null;
    const department = req.body.department || null;
    const supplierCode = req.body.supplierCode || null;
    const inMoney = req.body.inMoney || null;
    if (!barcode) return res.json({ status: false, msg: { en: "Product barcode is required!" } });
    if (!productName) return res.json({ status: false, msg: { en: "Product name is required!" } });
    if (!UOM) return res.json({ status: false, msg: { en: "Unit of measure is required!" } });
    if (!department) return res.json({ status: false, msg: { en: "The department is required!" } });
    if (!supplierCode)
        return res.json({ status: false, msg: { en: "Supplier code is required!" } });
    if (!inMoney || typeof parseInt(inMoney) !== "number")
        return res.json({
            status: false,
            msg: { en: "Price is required and must be a valid value!" },
        });
    const productQuery = await productModel.findOne({ barcode });
    if (productQuery)
        return res.json({ status: false, msg: { en: "This product has been already existed!" } });
    const supplierQuery = await supplierModel.findOne({ supplierCode });
    if (!supplierQuery) return res.json({ status: false, msg: { en: "Invalid supplier code!" } });
    const supplierName = supplierQuery.supplierName;
    const product = new productModel({
        barcode,
        productName,
        unitOfMeasure: UOM,
        department,
        supplierCode,
        supplierName,
        inMoney: parseInt(inMoney),
    });
    product.save();
    return res.json({ status: true, msg: { en: "Created a new product!" }, data: product });
});

module.exports = Router;
