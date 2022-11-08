const bcrypt = require("bcrypt");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");
const xlsxFile = require("read-excel-file/node");
const phoneNumberValidator = require("validate-phone-number-node-js");
const accountModel = require("../../models/account");
const adminConfig = require("../../configs/adminConfig");
const customerModel = require("../../models/customer");

module.exports = {
    customerNew: async (req, res, next) => {
        const customerID = req.body.customerID || null;
        const fullName = req.body.fullName || null;
        const customerQuery = await customerModel.findOne({ customerID });

        if (!customerID || !phoneNumberValidator.validate(customerID))
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Phone number of customer is required and must be a valid phone number.",
                    vn: "Số điện thoại khách hàng là bắt buộc và phải là số điện thoại hợp lệ.",
                },
            });

        if (customerQuery)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "This phone number is already in used. Please try another phone number.",
                    vn: "Số điện thoại này đã được sử dụng, vui lòng sử dụng số điện thoại khác.",
                },
                unpaidTransaction,
            });
    },
};
