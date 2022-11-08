const xlsxFile = require("read-excel-file/node");

// const productModel = require("../../models/product");
const checkInOutModel = require("../../models/checkInOut");
const employeeModel = require("../../models/employee");
const accountModel = require("../../models/account");
const phoneNumberValidator = require("validate-phone-number-node-js");

module.exports = {
    employeeGetAll: async (req, res, next) => {
        try {
        } catch (error) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                msg: { en: "Interal Server Error" },
                error: error.message,
            });
        }
    },
};
