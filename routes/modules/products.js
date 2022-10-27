const xlsxFile = require("read-excel-file/node");

const productModel = require("../../models/product");
const supplierModel = require("../../models/supplier");

module.exports = {
    productImport: async (req, res, next) => {
        /*
            #swagger.tags = ['Products']
            #swagger.description = 'Admin can user this endpoint for importing list of products to database instead of register for each one.'
            #swagger.consumes = ['multipart/form-data']  
            #swagger.parameters['file'] = {
                in: 'formData',
                type: 'file',
                required: 'true',
                description: 'Upload excel file data. Only excel format is allowed.',
            } 
        */
        const rows = await xlsxFile(req.file.path);
        if (
            rows[0][0].toUpperCase() !== "BARCODE" ||
            rows[0][1].toUpperCase() !== "PRODUCT NAME" ||
            rows[0][2].toUpperCase() !== "UOM" ||
            rows[0][3].toUpperCase() !== "DEPARTMENT" ||
            rows[0][4].toUpperCase() !== "SUPPLIER CODE" ||
            rows[0][5].toUpperCase() !== "UNIT COST" ||
            rows[0][6].toUpperCase() !== "QUANTITY"
        )
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: { en: "Invalid format excel file.", vn: "Tập tin excel không đúng cấu trúc." },
            });

        rows.forEach(async (element, index) => {
            if (index > 0) {
                let supplierQuery = await supplierModel.findOne({ supplierCode: element[4] });
                await productModel.findOneAndUpdate(
                    { barcode: element[0].toUpperCase() },
                    {
                        barcode: element[0].toUpperCase(),
                        productName: element[1].toUpperCase(),
                        unitOfMeasure: element[2].toUpperCase(),
                        department: element[3].toUpperCase(),
                        supplierCode: element[4].toUpperCase(),
                        supplierName: supplierQuery ? supplierQuery.supplierName : "Unknown",
                        unitCost: element[5] ? element[5] : "0",
                        quantity: element[6] ? parseInt(element[6]) : 0,
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            }
        });
        return res.status(200).json({
            status: true,
            statusCode: 200,
            msg: {
                en: "All products has been import successfully!",
                vn: "Đã nhập danh sách sản phẩm thành công!",
            },
        });
    },
    productQuantityImport: async (req, res, next) => {
        /*
            #swagger.tags = ['Products']
            #swagger.description = 'Admin can user this endpoint for importing quantity of products to database instead of register for each one.'
            #swagger.consumes = ['multipart/form-data']  
            #swagger.parameters['file'] = {
                in: 'formData',
                type: 'file',
                required: 'true',
                description: 'Upload excel file data. Only excel format is allowed.',
            } 
        */
        const rows = await xlsxFile(req.file.path);
        if (rows[0][0].toUpperCase() !== "BARCODE" || rows[0][1].toUpperCase() !== "QUANTITY")
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: { en: "Invalid format excel file.", vn: "Tập tin excel không đúng cấu trúc." },
            });
        rows.forEach(async (element, index) => {
            if (index > 0) {
                await productModel.findOneAndUpdate(
                    { barcode: element[0].toUpperCase() },
                    {
                        quantity: element[1] ? parseInt(element[1]) : 0,
                    }
                );
            }
        });
        return res.status(200).json({
            status: true,
            statusCode: 200,
            msg: {
                en: "All product quantities has been import successfully!",
                vn: "Đã nhập danh sách số lượng sản phẩm thành công!",
            },
        });
    },
    productRegister: async (req, res, next) => {
        // #swagger.tags = ['Products']
        // #swagger.description = 'This endpoint provides method for registering each of product.'
        const barcode = req.body.barcode ? req.body.barcode.toUpperCase() : null;
        const productName = req.body.productName ? req.body.productName.toUpperCase() : null;
        const UOM = req.body.UOM ? req.body.UOM.toUpperCase() : null;
        const department = req.body.department ? req.body.department.toUpperCase() : null;
        const supplierCode = req.body.supplierCode ? req.body.supplierCode.toUpperCase() : null;
        const unitCost = req.body.unitCost || null;
        const quantity = req.body.unitCost ? parseInt(req.body.quantity) : 0;
        const productQuery = await productModel.findOne({ barcode });
        const supplierQuery = await supplierModel.findOne({ supplierCode });
        const regex = /^([\u20AC]?[1-9]\d*\.\d{3}(?:,\d{2,9})?|[\u20AC]?[1-9]\d*(?:,\d{2,9})?|[\u20AC]?[1-9]\d*)$/;
        if (!barcode)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Barcode is required!",
                    vn: "Mã vạch sản phẩm là bắt buộc.",
                },
            });
        if (!productName)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Product name is required!",
                    vn: "Tên sản phẩm là bắt buộc.",
                },
            });
        if (!UOM)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Unit of measure is required!",
                    vn: "Đơn vị đo lường là bắt buộc.",
                },
            });
        if (!department)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "The department is required!",
                    vn: "Phân loại sản phẩm là bắt buộc.",
                },
            });
        if (!supplierCode)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "The supplier code is required!",
                    vn: "Mã nhà cung cấp là bắt buộc.",
                },
            });
        if (!unitCost || !regex.test(unitCost))
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Price is required and must be a valid value!",
                    vn: "Giá sản phẩm là bắt buộc và phải là định dạng tiền tệ hợp lệ.",
                },
            });
        if (!quantity)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Quantity of product is required!",
                    vn: "Số lượng sản phẩm là bắt buộc.",
                },
            });
        if (productQuery)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "This product barcode has been existed!",
                    vn: `Mã vạch "${barcode}" của sản phẩm "${productName}" đã tồn tại.`,
                },
            });
        if (!supplierQuery)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: `The supplier code "${supplierCode}" is invalid, there is no data for this supplier.`,
                    vn: `Mã nhà cung "${supplierCode} không hợp lệ, không có dữ liệu về nhà cung cấp này."`,
                },
            });
        const product = new productModel({
            barcode,
            productName,
            unitOfMeasure: UOM,
            department,
            supplierCode,
            supplierName: supplierQuery.supplierName,
            unitCost,
            quantity,
        });
        product.save();
        return res.status(200).json({
            status: false,
            statusCode: 200,
            msg: {
                en: `The "${barcode}" has been registered successfully!`,
                vn: `Mã vạch sản phẩm "${barcode}" đã được tạo thành công.`,
            },
        });
    },
    productGetDetail: async (req, res, next) => {
        // #swagger.tags = ['Products']
        // #swagger.description = 'Admin can show the detail of any products by using this endpoint.'
        const barcode = req.query.barcode ? req.query.barcode.toUpperCase() : null;
        const productQuery = await productModel.findOne({ barcode });
        if (!barcode)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Barcode is required!",
                    vn: "Mã vạch sản phẩm là bắt buộc.",
                },
            });
        if (productQuery) {
            const supplierQuery = await supplierModel.findOne({ supplierCode: productQuery.supplierCode });
            const productRefsList = await productModel.find({ supplierCode: productQuery.supplierCode });
            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {
                    en: `Detail of product "${productQuery.productName}"`,
                    vn: `Thông tin chi tiết của sản phẩm "${productQuery.productName}"`,
                },
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
            return res.status(404).json({
                status: false,
                statusCode: 404,
                msg: {
                    en: `Product barcode "${barcode}" not found or has been removed, contact developer for more detail!`,
                    vn: `Không tìm thấy mã vạch sản phẩm "${barcode}", hoặc đã bị gỡ bỏ, vui lòng liên hệ quản trị viên.`,
                },
            });
        }
    },
    productGetAll: async (req, res, next) => {
        // #swagger.tags = ['Products']
        // #swagger.description = 'Admin can list of all products by using this endpoint.'
        const perPage = 50;
        let page = parseInt(req.query.page) || 1;
        productModel
            .find({})
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec((err, productList) => {
                productModel.countDocuments((err, totalProducts) => {
                    if (err) return next(err);
                    const pageTotal = Math.ceil(totalProducts / perPage);
                    if (productList.length > 0) {
                        return res.status(200).json({
                            status: true,
                            statusCode: 200,
                            msg: { en: "Get list of all products.", vn: "Danh sách tất cả sản phẩm." },
                            curentPage: page,
                            totalProducts,
                            pageTotal,
                            result: {
                                perPage: productList.length,
                                data: productList,
                            },
                        });
                    } else {
                        return res.status(200).json({
                            status: true,
                            statusCode: 200,
                            msg: { en: "There is no data.", vn: "Danh sách trống, không có dữ liệu nào." },
                            result: [],
                        });
                    }
                });
            });
    },
    productGetOutOfStock: async (req, res, next) => {
        // #swagger.tags = ['Products']
        // #swagger.description = 'Admin can list of all products that is out of stock by using this endpoint.'
        const perPage = 50;
        let page = parseInt(req.query.page) || 1;
        productModel
            .find({ quantity: 0 })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec((err, productList) => {
                productModel.countDocuments({ quantity: 0 }, (err, totalOutOfStock) => {
                    if (err) return next(err);
                    const pageTotal = Math.ceil(totalOutOfStock / perPage);
                    if (productList.length > 0) {
                        return res.status(200).json({
                            status: true,
                            statusCode: 200,
                            msg: {
                                en: "Get list of all out of stock products.",
                                vn: "Danh sách tất cả sản phẩm hết hàng.",
                            },
                            curentPage: page,
                            totalOutOfStock,
                            pageTotal,
                            result: {
                                perPage: productList.length,
                                data: productList,
                            },
                        });
                    } else {
                        return res.status(200).json({
                            status: true,
                            statusCode: 200,
                            msg: { en: "There is no data.", vn: "Danh sách trống, không có dữ liệu nào." },
                            result: [],
                        });
                    }
                });
            });
    },
    productDelete: async (req, res, next) => {
        // #swagger.tags = ['Products']
        // #swagger.description = 'Admin can remove any products through this endpoint.'
        const barcode = req.body.barcode ? req.body.barcode.toUpperCase() : null;
        const productQuery = await productModel.findOne({ barcode });
        if (!barcode)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Barcode is required!",
                    vn: "Mã vạch sản phẩm là bắt buộc.",
                },
            });
        if (!productQuery)
            return res.status(404).json({
                status: false,
                statusCode: 404,
                msg: {
                    en: `Product barcode "${barcode}" not found or has been removed, contact developer for more detail!`,
                    vn: `Không tìm thấy mã vạch sản phẩm "${barcode}", hoặc đã bị gỡ bỏ, vui lòng liên hệ quản trị viên.`,
                },
            });
        await productModel.deleteOne({ barcode });
        return res.status(200).json({
            status: true,
            statusCode: 200,
            msg: {
                en: `Product barcode "${barcode}" has been removed successfully!`,
                vn: `Mã vạch sản phẩm "${barcode}" đã được gỡ bỏ thành công.`,
            },
        });
    },
    productUpdateQuantity: async (req, res, next) => {
        // #swagger.tags = ['Products']
        // #swagger.description = 'Admin can update product quantity through this endpoint.'
        const barcode = req.body.barcode ? req.body.barcode.toUpperCase() : null;
        const quantity = req.body.quantity ? parseInt(req.body.quantity) : null;
        const productQuery = await productModel.findOne({ barcode });
        if (!barcode)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Barcode is required!",
                    vn: "Mã vạch sản phẩm là bắt buộc.",
                },
            });
        if (quantity === null)
            return res.status(200).json({
                status: false,
                statusCode: 200,
                msg: {
                    en: "Product quantity is required!",
                    vn: "Số lượng sản phẩm là bắt buộc.",
                },
            });
        if (!productQuery)
            return res.status(404).json({
                status: false,
                statusCode: 404,
                msg: {
                    en: `Product barcode "${barcode}" not found or has been removed, contact developer for more detail!`,
                    vn: `Không tìm thấy mã vạch sản phẩm "${barcode}", hoặc đã bị gỡ bỏ, vui lòng liên hệ quản trị viên.`,
                },
            });
        await productModel.findOneAndUpdate({ barcode }, { quantity });
        return res.status(200).json({
            status: false,
            statusCode: 200,
            msg: {
                en: `The quantity of "${barcode}" has been updated successfully!`,
                vn: `Đã cập nhật thành công số lượng của barcode "${barcode}".`,
            },
        });
    },
};
