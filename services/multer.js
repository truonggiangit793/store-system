const multer = require('multer');
const { v4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const multerStorage = {
    accountImport: function (req, res, next) {
        const upload = multer({
            storage: multer.diskStorage({
                destination: (req, res, callback) => {
                    var dir = path.resolve(__dirname, '../', 'data');
                    !fs.existsSync(dir) ? fs.mkdirSync(dir) : null;
                    callback(null, dir);
                },
                filename: (req, file, callback) => {
                    const id = v4();
                    callback(
                        null,
                        `account_${id}.${file.originalname.split('.')[1]}`,
                    );
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, callback) => {
                const validMimeType =
                    file.mimetype ==
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                if (validMimeType) {
                    callback(null, true);
                } else {
                    callback(null, false);
                    const err = new Error('Extension Error');
                    err.message = { en: 'Only accept *.xlsx file!' };
                    return callback(err);
                }
            },
        }).single('file');

        upload(req, res, (err) => {
            if (err) {
                return res.json({ status: false, msg: err.message });
            } else {
                next();
            }
        });
    },

    productImport: function (req, res, next) {
        const upload = multer({
            storage: multer.diskStorage({
                destination: (req, res, callback) => {
                    var dir = path.resolve(__dirname, '../', 'data');
                    !fs.existsSync(dir) ? fs.mkdirSync(dir) : null;
                    callback(null, dir);
                },
                filename: (req, file, callback) => {
                    const id = v4();
                    callback(
                        null,
                        `product_${id}.${file.originalname.split('.')[1]}`,
                    );
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, callback) => {
                const validMimeType =
                    file.mimetype ==
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                if (validMimeType) {
                    callback(null, true);
                } else {
                    callback(null, false);
                    const err = new Error('Extension Error');
                    err.message = { en: 'Only accept *.xlsx file!' };
                    return callback(err);
                }
            },
        }).single('file');

        upload(req, res, (err) => {
            if (err) {
                return res.json({ status: false, msg: err.message });
            } else {
                next();
            }
        });
    },
    supplierImport: function (req, res, next) {
        const upload = multer({
            storage: multer.diskStorage({
                destination: (req, res, callback) => {
                    var dir = path.resolve(__dirname, '../', 'data');
                    !fs.existsSync(dir) ? fs.mkdirSync(dir) : null;
                    callback(null, dir);
                },
                filename: (req, file, callback) => {
                    const id = v4();
                    callback(
                        null,
                        `supplier_${id}.${file.originalname.split('.')[1]}`,
                    );
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, callback) => {
                const validMimeType =
                    file.mimetype ==
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                if (validMimeType) {
                    callback(null, true);
                } else {
                    callback(null, false);
                    const err = new Error('Extension Error');
                    err.message = { en: 'Only accept *.xlsx file!' };
                    return callback(err);
                }
            },
        }).single('file');

        upload(req, res, (err) => {
            if (err) {
                return res.json({ status: false, msg: err.message });
            } else {
                next();
            }
        });
    },
};

module.exports = multerStorage;
