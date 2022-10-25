const Router = require('express').Router();
const authorization = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const multer = require('../services/multer');

const {
    login,
    importAccount,
    registerAccount,
    getProfile,
    disableAccount,
    accountGetAll,
    accountUpdateMe,
    accountChangePassword,
} = require('./modules/accounts');

const {
    importSupplier,
    supplierRegister,
    supplierDelete,
    supplierGetAll,
    supplierGetDetail,
} = require('./modules/suppliers');

const {
    productImport,
    productRegister,
    productGetDetail,
    productGetAll,
    productDelete,
} = require('./modules/products');

const downloadExample = require('./modules/download_example');

Router.post('/login', login);

Router.post(
    '/account/import',
    authorization.admin,
    multer.accountImport,
    importAccount,
);

Router.post('/account/register', authorization.admin, registerAccount);

Router.delete('/account/disable', authorization.admin, disableAccount);

Router.get('/account/me', authentication, getProfile);

Router.put('/account/update-me', authentication, accountUpdateMe);

Router.patch('/account/change-password', authentication, accountChangePassword);

Router.get('/account/get-all', authorization.admin, accountGetAll);

Router.post(
    '/supplier/import',
    authorization.admin,
    multer.supplierImport,
    importSupplier,
);

Router.post('/supplier/register', authorization.admin, supplierRegister);

Router.get('/supplier/get-detail', authorization.admin, supplierGetDetail);

Router.get('/supplier/get-all', authorization.admin, supplierGetAll);

Router.delete('/supplier/delete', authorization.admin, supplierDelete);

Router.post(
    '/products/import',
    authorization.admin,
    multer.productImport,
    productImport,
);

Router.post('/products/register', authorization.admin, productRegister);

Router.get('/products/get-detail', authentication, productGetDetail);

Router.get('/products/get-all', authentication, productGetAll);

Router.delete('/products/delete', authentication, productDelete);

Router.get(
    '/file/download-example-account',
    authentication,
    downloadExample.downloadAccountExample,
);

Router.get(
    '/file/download-example-supplier',
    authentication,
    downloadExample.downloadSupplierExample,
);

Router.get(
    '/file/download-example-product',
    authentication,
    downloadExample.downloadProductExample,
);

module.exports = Router;
