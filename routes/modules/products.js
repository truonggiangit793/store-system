const xlsxFile = require("read-excel-file/node");

const productModel = require("../../models/product");
const supplierModel = require("../../models/supplier");

module.exports = {
    productImport: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"];
        if (!req.file)
            return res.json({ status: false, msg: { en: "Excel file data is required!" } });
        const rows = await xlsxFile(req.file.path);
        const invalidFormat =
            rows[0][0].toUpperCase() !== "BARCODE" ||
            rows[0][1].toUpperCase() !== "PRODUCT NAME" ||
            rows[0][2].toUpperCase() !== "UOM" ||
            rows[0][3].toUpperCase() !== "DEPARTMENT" ||
            rows[0][4].toUpperCase() !== "SUPPLIER CODE" ||
            rows[0][5].toUpperCase() !== "UNIT COST";

        if (invalidFormat)
            return res.json({
                status: false,
                msg: { en: `Invalid format excel file!` },
            });

        rows.forEach(async (element, index) => {
            if (index > 0) {
                let query = { barcode: element[0] };
                let supplier = await supplierModel.findOne({ supplierCode: element[4] });
                let update = {
                    barcode: element[0].toUpperCase(),
                    productName: element[1].toUpperCase(),
                    unitOfMeasure: element[2].toUpperCase(),
                    department: element[3].toUpperCase(),
                    supplierCode: element[4].toUpperCase(),
                    supplierName: supplier ? supplier.supplierName : "Unknown",
                    unitCost: element[5] ? element[5] : "0",
                };
                let options = { upsert: true, new: true, setDefaultsOnInsert: true };
                productModel.findOneAndUpdate(query, update, options, function (error, result) {
                    if (!error) {
                        // If the document doesn't exist
                        result = !result ? new productModel() : result;
                        // Save the document
                        result.save();
                    }
                });
            }
        });
        return res.json({ status: true, msg: { en: "Master products data synced success!" } });
    },
    productRegister: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"];
        const barcode = req.body.barcode ? req.body.barcode.toUpperCase() : null;
        const productName = req.body.productName || null;
        const UOM = req.body.UOM || null;
        const department = req.body.department || null;
        const supplierCode = req.body.supplierCode || null;
        const unitCost = req.body.unitCost || null;

        if (!barcode)
            return res.json({ status: false, msg: { en: "Product barcode is required!" } });
        if (!productName)
            return res.json({ status: false, msg: { en: "Product name is required!" } });
        if (!UOM) return res.json({ status: false, msg: { en: "Unit of measure is required!" } });
        if (!department)
            return res.json({ status: false, msg: { en: "The department is required!" } });
        if (!supplierCode)
            return res.json({ status: false, msg: { en: "Supplier code is required!" } });

        var regex =
            /^([\u20AC]?[1-9]\d*\.\d{3}(?:,\d{2,9})?|[\u20AC]?[1-9]\d*(?:,\d{2,9})?|[\u20AC]?[1-9]\d*)$/;

        if (!unitCost || !regex.test(unitCost))
            return res.json({
                status: false,
                msg: { en: "Price is required and must be a valid value!" },
            });

        const productQuery = await productModel.findOne({ barcode });
        if (productQuery)
            return res.json({
                status: false,
                msg: { en: "This product has been already existed!" },
            });

        const supplierQuery = await supplierModel.findOne({ supplierCode });
        if (!supplierQuery)
            return res.json({ status: false, msg: { en: "Invalid supplier code!" } });

        const supplierName = supplierQuery.supplierName;
        const product = new productModel({
            barcode,
            productName,
            unitOfMeasure: UOM,
            department,
            supplierCode,
            supplierName,
            unitCost,
        });
        product.save();
        return res.json({ status: true, msg: { en: "Created a new product!" }, data: product });
    },
    productGetDetail: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"];
        const barcode = req.query.barcode ? req.query.barcode.toUpperCase() : null;
        if (!barcode)
            return res.json({ status: false, msg: { en: "Product barcode is required!" } });

        const productQuery = await productModel.findOne({ barcode });

        if (productQuery) {
            const supplierQuery = await supplierModel.findOne({
                supplierCode: productQuery.supplierCode,
            });
            const productRefsList = await productModel.find({
                supplierCode: productQuery.supplierCode,
            });
            return res.json({
                status: true,
                msg: { en: "Get product details!" },
                result: {
                    data: productQuery,
                    related: {
                        supplier: supplierQuery,
                        productRefs: {
                            total: productRefsList.length,
                            data: productRefsList.length > 0 ? productRefsList : [],
                        },
                    },
                },
            });
        } else {
            return res.json({
                status: false,
                msg: {
                    en: "Product not found or has been removed, contact developer for more detail!",
                },
            });
        }
    },
    productGetAll: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"];
        const productList = await productModel.find({});
        if (productList.length > 0) {
            return res.json({
                status: true,
                msg: { en: "Get list of all products!" },
                result: {
                    total: productList.length,
                    data: productList.length > 0 ? productList : [],
                },
            });
        } else {
            return res.json({ status: false, msg: { en: "There is no data!" } });
        }
    },
    productDelete: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"];
        const barcode = req.query.barcode ? req.query.barcode.toUpperCase() : null;
        if (!barcode) return res.json({ status: false, msg: { en: "Barcode is required!" } });

        const productQuery = await productModel.findOne({ barcode });

        if (!productQuery)
            return res.json({
                status: false,
                msg: { en: "Invalid supplier code, supplier code not found!" },
            });

        await productModel.deleteOne({ barcode });
        res.json({ status: true, msg: { en: "Product has been removed!" } });
    },
};
