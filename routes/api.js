const Router = require("express").Router();
const authorization = require("../middlewares/authorization");
const authentication = require("../middlewares/authentication");
const multer = require("../services/multer");

const { login, importAccount, registerAccount, getProfile } = require("./modules/accounts");
const { importSupplier, supplierRegister } = require("./modules/suppliers");
const { productImport, productRegister } = require("./modules/products");
const downloadExample = require("./modules/download_example");

Router.post("/login", login);

Router.post("/account/import", authorization.admin, multer.accountImport, importAccount);

Router.post("/account/register", authorization.admin, registerAccount);

Router.get("/account/me", authentication, getProfile);

Router.post("/supplier/import", authorization.admin, multer.supplierImport, importSupplier);

Router.post("/supplier/register", authorization.admin, supplierRegister);

Router.post("/products/import", authorization.admin, multer.productImport, productImport);

Router.post("/products/register", authorization.admin, productRegister);

Router.get(
    "/file/download-example-account",
    authentication,
    downloadExample.downloadAccountExample
);

Router.get(
    "/file/download-example-supplier",
    authentication,
    downloadExample.downloadSupplierExample
);

Router.get(
    "/file/download-example-product",
    authentication,
    downloadExample.downloadProductExample
);

module.exports = Router;
