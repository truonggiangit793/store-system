const jwt = require('jsonwebtoken');
const accountModel = require('../models/account');

const authentication = async (req, res, next) => {
    const token = req.query.token || req.headers['x-access-token'];
    try {
        const payload = await jwt.verify(token, process.env.SECRET_KEY);
        if (payload.data) {
            const userCode = payload.data.userCode || null;
            const accountQuery = await accountModel.findOne({ userCode });
            console.log({
                userCode,
                tokenRequest: token,
                validToken: accountQuery.access_token,
            });
            if (accountQuery && token == accountQuery.access_token) {
                return next();
            }
        }
        return res.json({
            status: false,
            msg: 'Permission denied! Invalid token or access token has been expired.',
        });
    } catch (error) {
        return res.json({
            status: false,
            msg: 'Permission denied!',
            err: {
                name: 'Params error',
                message: error.message,
            },
        });
    }
};

module.exports = authentication;
