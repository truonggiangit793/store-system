const Router = require("express").Router();
const authorization = require("../middlewares/authorization");
const authentication = require("../middlewares/authentication");
const multerService = require("../services/multer");
const downloadExample = require("./modules/examples");

const { test, end } = require("./modules/test");

const {
    accountLogin,
    accountImport,
    accountRegister,
    accountGetProfile,
    accountDisable,
    accountGetAll,
    accountUpdateMe,
    accountChangePassword,
} = require("./modules/accounts");

const {
    productImport,
    productQuantityImport,
    productRegister,
    productGetDetail,
    productGetAll,
    productGetOutOfStock,
    productOutOfStockExport,
    productDelete,
    productUpdateQuantity,
    productUpdatePrice,
} = require("./modules/products");

const { supplierImport, supplierRegister, supplierDelete, supplierGetAll, supplierGetDetail } = require("./modules/suppliers");

const {
    transactionNew,
    transactionOrder,
    transactionGetDetail,
    transactionCancel,
    transactionToPay,
    transactionAddCustomer,
    transactionTogglePoint,
} = require("./modules/transaction");

const { customerNew } = require("./modules/customer");

const { attendanceCheckIn, attendanceGetAll, attendanceCheckOut, attendanceReport } = require("./modules/attendance");

const { employeeGetAll } = require("./modules/employee");

const { reportGetAllTransaction } = require("./modules/report");

/**
 * Account ================================================================
 */

Router.post("/account/login", accountLogin);

Router.post("/account/import", authentication, authorization.admin, multerService, accountImport);

Router.post("/account/register", authentication, authorization.admin, accountRegister);

Router.delete("/account/disable", authentication, authorization.admin, accountDisable);

Router.get("/account/me", authentication, accountGetProfile);

Router.put("/account/update-me", authentication, accountUpdateMe);

Router.put("/account/change-password", authentication, accountChangePassword);

Router.get("/account/get-all", authentication, authorization.admin, accountGetAll);

Router.get("/account/download-example", authentication, downloadExample.downloadAccountExample);

/**
 * Supplier ================================================================
 */

Router.post("/supplier/import", authentication, authorization.admin, multerService, supplierImport);

Router.post("/supplier/register", authentication, authorization.admin, supplierRegister);

Router.get("/supplier/get-detail", authentication, authorization.admin, supplierGetDetail);

Router.get("/supplier/get-all", authentication, authorization.admin, supplierGetAll);

Router.delete("/supplier/delete", authentication, authorization.admin, supplierDelete);

Router.get("/supplier/download-example", authentication, downloadExample.downloadSupplierExample);

/**
 * Product ================================================================
 */

Router.post("/product/import", authentication, authorization.admin, multerService, productImport);

Router.post("/product/quantity-import", authentication, authorization.admin, multerService, productQuantityImport);

Router.post("/product/register", authentication, authorization.admin, productRegister);

Router.get("/product/get-detail", authentication, productGetDetail);

Router.get("/product/get-all", authentication, productGetAll);

Router.get("/product/get-out-of-stock", authentication, productGetOutOfStock);

Router.get("/product/out-of-stock/export", authentication, productOutOfStockExport);

Router.delete("/product/delete/:barcode", authentication, productDelete);

Router.put("/product/update-quantity", authentication, authorization.admin, productUpdateQuantity);

Router.get("/product/download-example", authentication, downloadExample.downloadProductExample);

Router.put("/product/update-price", authentication, authorization.admin, productUpdatePrice);

/**
 * Customer ================================================================
 */

Router.post("/customer/new", authentication, customerNew);

/**
 * Transaction ================================================================
 */

Router.post("/transaction/new", authentication, transactionNew);

Router.get("/transaction/:transactionID", authentication, transactionGetDetail);

Router.post("/transaction/:transactionID/order", authentication, authorization.checkPayStatus, transactionOrder);

Router.post("/transaction/:transactionID/add-customer", authentication, authorization.checkPayStatus, transactionAddCustomer);

Router.post("/transaction/:transactionID/toggle-point", authentication, authorization.checkPayStatus, transactionTogglePoint);

Router.delete("/transaction/:transactionID/delete", authentication, authorization.checkPayStatus, transactionCancel);

Router.post("/transaction/:transactionID/pay", authentication, authorization.checkPayStatus, transactionToPay);

/**
 * Attendace ================================================================
 */

Router.post("/attendance/checkin", attendanceCheckIn);

Router.post("/attendance/checkout", attendanceCheckOut);

Router.get("/attendance/get-all", authentication, authorization.admin, attendanceGetAll);

Router.get("/attendance/report", authentication, authorization.admin, attendanceReport);

/**
 * Employee ================================================================
 */

Router.get("/employee/", employeeGetAll);

/**
 * Report ================================================================
 */

Router.get("/report/transaction/get-all", authentication, authorization.admin, reportGetAllTransaction);

Router.get("/test", test, end);

module.exports = Router;
