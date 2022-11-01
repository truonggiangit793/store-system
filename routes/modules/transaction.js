const xlsxFile = require("read-excel-file/node");
const jwt = require("jsonwebtoken");
const productModel = require("../../models/product");
const supplierModel = require("../../models/supplier");
const accountModel = require("../../models/account");
const transactionModel = require("../../models/transaction");
const phoneNumberValidator = require("validate-phone-number-node-js");

module.exports = {
    transactionNew: async (req, res, next) => {
        try {
            const lengthID = 10;
            const transactionID = Math.floor(Math.pow(10, lengthID - 1) + Math.random() * 9 * Math.pow(10, lengthID - 1));

            const token = req.query.token || req.headers["x-access-token"];
            const currentSession = jwt.verify(token, process.env.SECRET_KEY);

            const unpaidTransaction = await transactionModel.findOne({
                cashierCode: currentSession.data.userCode,
                payStatus: false,
            });

            if (unpaidTransaction) {
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "There is a transaction which has not been paid. Please finish this transaction first!",
                        vn: "Tồn tại một giao dịch chưa thanh toán, vui lòng hoàn tất giao dịch này.",
                    },
                    unpaidTransaction,
                });
            }
            const transaction = new transactionModel({
                transactionID,
                cashierCode: currentSession.data.userCode,
                cashierName: currentSession.data.fullName,
            });
            transaction.save();
            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {
                    en: "A transaction is already to pay!",
                    vn: "Một giao dịch mới sẵn sàng để thanh toán.",
                },
                transaction,
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
    transactionOrder: async (req, res, next) => {
        try {
            const transactionID = parseInt(req.params.transactionID) || 0;
            const token = req.query.token || req.headers["x-access-token"];
            const currentSession = jwt.verify(token, process.env.SECRET_KEY);
            const barcode = req.body.barcode ? req.body.barcode.toUpperCase() : null;
            const productQtyToOrder = req.body.qty ? parseInt(req.body.qty) : 1;
            const productQuery = await productModel.findOne({ barcode });
            const transactionQuery = await transactionModel.findOne({ transactionID });

            if (!transactionQuery) {
                return res.status(404).json({
                    status: false,
                    statusCode: 404,
                    msg: {
                        en: `This transaction not found. Please create a new transaction!`,
                        vn: `Giao dịch này không tồn tại, vui lòng thực hiện lại.`,
                    },
                });
            }

            if (!productQuery) {
                return res.status(404).json({
                    status: false,
                    statusCode: 404,
                    msg: {
                        en: `Product barcode "${barcode}" not found or has been removed, contact developer for more detail!`,
                        vn: `Không tìm thấy mã vạch sản phẩm "${barcode}", hoặc đã bị gỡ bỏ, vui lòng liên hệ quản trị viên.`,
                    },
                });
            }

            if (productQuery.quantity <= 0) {
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: `Product barcode "${barcode}" does not have a quantity for this transaction!`,
                        vn: `Sản phẩm có mã vạch "${barcode}" không đủ số lượng để cung cấp cho giao dịch này.`,
                    },
                });
            }

            console.log({ transactionQuery });

            console.log({ productQuery });

            // console.log(transactionQuery);

            // let cart = transactionQuery.details || [];

            // cart.push({
            //     barcode: productQuery.barcode,
            //     productName: productQuery.productName,
            //     unitCost: productQuery.unitCost,
            // });

            // transactionModel.findOneAndUpdate(
            //     { transactionID },
            //     {
            //         details: cart,
            //         totalPrice: transactionQuery.totalPrice + productQuery.unitCost,
            //     }
            // );

            // return res.status(200).json({
            //     status: true,
            //     statusCode: 200,
            //     msg: {
            //         en: "A new product has been added into this transaction!",
            //         vn: "Một sản phẩm đã được thêm vào giao dịch này.",
            //     },
            // });
            res.end("testing");
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
