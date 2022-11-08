const xlsxFile = require("read-excel-file/node");
const jwt = require("jsonwebtoken");
const productModel = require("../../models/product");
const supplierModel = require("../../models/supplier");
const accountModel = require("../../models/account");
const customerModel = require("../../models/customer");
const transactionModel = require("../../models/transaction");
const phoneNumberValidator = require("validate-phone-number-node-js");

module.exports = {
    transactionNew: async (req, res, next) => {
        // #swagger.tags = ['Transaction']
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
    transactionGetDetail: async (req, res, next) => {
        // #swagger.tags = ['Transaction']
        try {
            const transactionID = parseInt(req.params.transactionID) || 0;
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
            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {
                    en: `Get transaction ${transactionID} successfully!`,
                    vn: `Thông tin chi tiết của giao dịch ${transactionID}`,
                },
                transactionQuery,
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
    transactionCancel: async (req, res, next) => {
        // #swagger.tags = ['Transaction']
        try {
            const transactionID = parseInt(req.params.transactionID) || 0;
            const transactionQuery = await transactionModel.findOne({ transactionID });
            if (!transactionID) {
                return res.status(404).json({
                    status: false,
                    statusCode: 404,
                    msg: {
                        en: `TransactionID product is require!`,
                        vn: `Mã giao dịch là bắt buộc.`,
                    },
                });
            }
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
            await transactionModel.remove({ transactionID });
            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {
                    en: `TransactionID "${transactionID}" has been removed successfully!`,
                    vn: `Giao dịch "${transactionID}" đã được gỡ bỏ thành công.`,
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
    transactionOrder: async (req, res, next) => {
        // #swagger.tags = ['Transaction']
        try {
            const transactionID = parseInt(req.params.transactionID) || 0;
            const barcode = req.body.barcode ? req.body.barcode.toUpperCase() : null;
            const productQtyToOrder = req.body.qty ? parseInt(req.body.qty) : 1;
            const productQuery = await productModel.findOne({ barcode });
            const transactionQuery = await transactionModel.findOne({ transactionID });
            let cart = transactionQuery.details || [];
            if (!barcode) {
                return res.status(404).json({
                    status: false,
                    statusCode: 404,
                    msg: {
                        en: `Barcode product is require!`,
                        vn: `Mã vạch sản phẩm là bắt buộc.`,
                    },
                });
            }
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
            if (cart.length == 0) {
                cart.push({
                    barcode: productQuery.barcode,
                    productName: productQuery.productName,
                    unitCost: productQuery.unitCost,
                    qty: productQtyToOrder,
                });
            } else {
                const found = cart.some((el) => el.barcode === barcode);
                if (found) {
                    cart.forEach((item) => {
                        if (item.barcode == barcode) item.qty += productQtyToOrder;
                    });
                } else {
                    cart.push({
                        barcode: productQuery.barcode,
                        productName: productQuery.productName,
                        unitCost: productQuery.unitCost,
                        qty: productQtyToOrder,
                    });
                }
            }
            await transactionModel.findOneAndUpdate(
                { transactionID },
                {
                    details: cart,
                    totalPrice: transactionQuery.totalPrice + productQuery.unitCost * productQtyToOrder,
                }
            );
            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {
                    en: "A new product has been added into this transaction!",
                    vn: "Một sản phẩm đã được thêm vào giao dịch này.",
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
    transactionToPay: async (req, res, next) => {
        // #swagger.tags = ['Transaction']
        try {
            const transactionID = parseInt(req.params.transactionID) || 0;
            const transactionQuery = await transactionModel.findOne({ transactionID, payStatus: false });
            if (!transactionID) {
                return res.status(404).json({
                    status: false,
                    statusCode: 404,
                    msg: {
                        en: `TransactionID product is require!`,
                        vn: `Mã giao dịch là bắt buộc.`,
                    },
                });
            }
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
            let totalPrice = parseInt(transactionQuery.totalPrice);
            const customerQuery = customerModel.findOne({ customerID: transactionQuery.customerID });
            if (customerQuery && transactionQuery.usePoint) {
                totalPrice -= customerQuery.point;
            }
            const cash = req.body.cash ? parseInt(req.body.cash) : parseInt(totalPrice);
            if (cash < parseInt(totalPrice)) {
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: `Transaction faild - Don't have enough money!`,
                        vn: `Giao dịch "${transactionID}" thất bại - không đủ tiền.`,
                    },
                });
            }
            const changeDue = cash - parseInt(totalPrice);
            await transactionModel.findOneAndUpdate({ transactionID }, { payStatus: true, cash, changeDue });
            transactionQuery.details.forEach(async (item) => {
                product = await productModel.findOne({ barcode: item.barcode });
                await productModel.findOneAndUpdate({ barcode: item.barcode }, { quantity: product.quantity - item.qty });
            });
            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {
                    en: `Transaction "${transactionID}" has been paid successfully!`,
                    vn: `Giao dịch "${transactionID}" được thanh toán thành công.`,
                },
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                statusCode: 500,
                msg: { en: "Interal Server Error" },
                error: error.message,
            });
        }
    },
    transactionAddCustomer: async (req, res, next) => {
        // #swagger.tags = ['Transaction']
        const customerID = req.body.customerID || null;
        const customerQuery = await customerModel.findOne({ customerID });
        const transactionID = req.params.transaction || null;
        if (!customerID || !phoneNumberValidator.validate(customerID))
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Customer's phone number is required and must be a valid phone number.",
                    vn: "Số điện thoại khách hàng là bắt buộc và phải là số điện thoại hợp lệ.",
                },
            });
        if (!customerQuery)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: `${customerID} is not defined as customer. Please create account first.`,
                    vn: `${customerID} chưa được đăng ký thành viên, vui lòng đăng ký trước khi thực hiện.`,
                },
            });
        await transactionModel.findOneAndUpdate({ transactionID }, { customerID });
        return res.status(200).json({
            status: true,
            statusCode: 200,
            msg: {
                en: `${customerQuery.fullName} has been added to this transaction.`,
                vn: `Khách hàng "${customerQuery.fullName}" đã được thêm vào giao dịch này.`,
            },
        });
    },
    transactionTogglePoint: async (req, res, next) => {
        // #swagger.tags = ['Transaction']
        const transactionID = req.params.transactionID || null;
        const transactionQuery = await transactionModel.findOne({ transactionID });
        if (!transactionID) {
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: `TransactionID product is require!`,
                    vn: `Mã giao dịch là bắt buộc.`,
                },
            });
        }
        if (!transactionQuery) {
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: `This transaction not found. Please create a new transaction!`,
                    vn: `Giao dịch này không tồn tại, vui lòng thực hiện lại.`,
                },
            });
        }
        await transactionModel.findOneAndUpdate({ transactionID }, { usePoint: !transactionQuery.usePoint });
        return res.status(200).json({
            status: true,
            statusCode: 200,
            msg: {
                en: "Apply customer's point status successfully!",
                vn: "Đã thay đổi trạng thái sử dụng điểm của khách hàng thành công.",
            },
        });
    },
};
