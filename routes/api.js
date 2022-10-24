const Router = require("express").Router();
const authorization = require("../middlewares/authorization");
const multer = require("../services/multer");

const { login, importAccount, registerAccount } = require("./modules/accounts");
const { importSupplier, supplierRegister } = require("./modules/suppliers");
const { productImport, productRegister } = require("./modules/products");

Router.post("/login", login);

Router.post("/account/import", authorization.admin, multer.accountImport, importAccount);

Router.post("/account/register", authorization.admin, registerAccount);

Router.post("/supplier/import", authorization.admin, multer.supplierImport, importSupplier);

Router.post("/supplier/register", authorization.admin, supplierRegister);

Router.post("/products/import", authorization.admin, multer.productImport, productImport);

Router.post("/products/register", authorization.admin, productRegister);

module.exports = Router;
