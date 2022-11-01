const xlsxFile = require("read-excel-file/node");
const jwt = require("jsonwebtoken");
const productModel = require("../../models/product");
const supplierModel = require("../../models/supplier");
const accountModel = require("../../models/account");
const phoneNumberValidator = require("validate-phone-number-node-js");

module.exports = {
    orderNewTransaction: async (req, res, next) => {
        // #swagger.tags = ['Oders']
        // #swagger.description = 'This endpoint using to make a new transaction for sale.'
        try {
            let details = [];
            let totalPrice = 0;
            const lengthID = 10;
            const transactionID = Math.floor(Math.pow(10, lengthID - 1) + Math.random() * 9 * Math.pow(10, lengthID - 1));
            const token = req.query.token || req.headers["x-access-token"];
            const payload = jwt.verify(token, process.env.SECRET_KEY);
            const orderList = req.body.orderList || [];
            const cash = req.body.cash ? parseInt(req.body.cash) : 0;
            const accountQuery = await accountModel.findOne({ userCode: payload.data.userCode });
            if (typeof orderList !== "object" || orderList.length < 1) {
                return res.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: {
                        en: "Type of oder list must be an object and at least 1 product!",
                        vn: "Kiểu dữ liệu của danh sách sản phẩm phải hợp lệ và tối thiểu 1 sản phẩm trong giỏ hàng.",
                    },
                });
            }
            await Promise.all(
                orderList.map(async (element) => {
                    let found = await productModel.findOne({ barcode: element.toString() });
                    if (found) {
                        totalPrice += parseInt(found.unitCost);
                        details.push({
                            barcode: found.barcode.toUpperCase(),
                            productName: found.productName,
                        });
                    }
                })
            );

            const paymentDetails = { totalPrice, cash: cash ? cash : 0, changeDue: cash ? cash - totalPrice : 0 };

            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {},
                data: {
                    transactionID,
                    cashierCode: accountQuery.userCode,
                    cashierName: accountQuery.fullName,
                    details,
                    paymentDetails,
                },
            });
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
