const xlsxFile = require("read-excel-file/node");

const supplierModel = require("../../models/supplier");
const phoneNumberValidator = require("validate-phone-number-node-js");

module.exports = {
    importSupplier: async (req, res, next) => {
        if (!req.file)
            return res.json({ status: false, msg: { en: "Excel file data is required!" } });
        const rows = await xlsxFile(req.file.path);
        const invalidFormat =
            rows[0][0].toUpperCase() !== "SUPPLIER CODE" ||
            rows[0][1].toUpperCase() !== "SUPPLIER NAME" ||
            rows[0][2].toUpperCase() !== "ADDRESS" ||
            rows[0][3].toUpperCase() !== "PHONE NUMBER";
        if (invalidFormat)
            return res.json({
                status: false,
                msg: { en: `Invalid format excel file!` },
            });

        rows.forEach((element, index) => {
            if (index > 0) {
                let query = { supplierCode: element[0] };
                let options = { upsert: true, new: true, setDefaultsOnInsert: true };
                let update = {
                    supplierCode: element[0].toUpperCase(),
                    supplierName: element[1].toUpperCase(),
                    address: element[2],
                    phoneNumber: element[3],
                };
                supplierModel.findOneAndUpdate(query, update, options, function (error, result) {
                    if (error) {
                        return res.json({
                            status: false,
                            msg: { en: "Failed! An error occured, please try again!" },
                        });
                    } else {
                        // If the document doesn't exist
                        result = !result ? new supplierModel() : result;
                        // Save the document
                        result.save();
                    }
                });
            }
        });
        return res.json({ status: true, msg: { en: "Supplier data synced success!" } });
    },
    supplierRegister: async (req, res, next) => {
        const supplierCode = req.body.supplierCode ? req.body.supplierCode.toUpperCase() : null;
        const supplierName = req.body.supplierName || null;
        const address = req.body.address || null;
        const phoneNumber = req.body.phoneNumber || null;
        if (!supplierCode)
            return res.json({ status: false, msg: { en: "Supplier code is required!" } });
        if (!supplierName)
            return res.json({ status: false, msg: { en: "Supplier name is required!" } });
        if (!address) return res.json({ status: false, msg: { en: "Address is required!" } });
        if (!phoneNumber || !phoneNumberValidator.validate(phoneNumber))
            return res.json({
                status: false,
                msg: { en: "Phone number is required and must be a valid phone number!" },
            });
        const supplierQuery = await supplierModel.findOne({ supplierCode });
        if (supplierQuery)
            return res.json({
                status: false,
                msg: { en: "Supplier code has been already existed!" },
            });
        const supplier = new supplierModel({ supplierCode, supplierName, address, phoneNumber });
        supplier.save();
        return res.json({ status: true, msg: { en: "Created a new supplier!" }, data: supplier });
    },
};
