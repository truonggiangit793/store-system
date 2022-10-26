const Router = require("express").Router();
const authorization = require("../middlewares/authorization");
const authentication = require("../middlewares/authentication");
const multerService = require("../services/multer");
const downloadExample = require("./modules/examples");

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
    supplierImport,
    supplierRegister,
    supplierDelete,
    supplierGetAll,
    supplierGetDetail,
} = require("./modules/suppliers");

const {
    productImport,
    productRegister,
    productGetDetail,
    productGetAll,
    productDelete,
} = require("./modules/products");

/**
 * Account ================================================================
 */
Router.post("/account/login", accountLogin);

Router.post("/account/import", authentication, authorization.admin, multerService, accountImport);

Router.post("/account/register", authentication, authorization.admin, accountRegister);

Router.delete("/account/disable", authentication, authorization.admin, accountDisable);

Router.get("/account/me", authentication, accountGetProfile);

Router.put("/account/update-me", authentication, accountUpdateMe);

Router.patch("/account/change-password", authentication, accountChangePassword);

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

Router.post("/product/register", authentication, authorization.admin, productRegister);

Router.get("/product/get-detail", authentication, productGetDetail);

Router.get("/product/get-all", authentication, productGetAll);

Router.delete("/product/delete", authentication, productDelete);

Router.get("/product/download-example", authentication, downloadExample.downloadProductExample);

module.exports = Router;
