const excel = require("excel4node");
const path = require("path");
const fs = require("fs");
const mime = require("mime");

const workbook = new excel.Workbook();
const worksheet = workbook.addWorksheet("Sheet");

const dir = path.resolve(__dirname, "../", "../", "data");
!fs.existsSync(dir) ? fs.mkdirSync(dir) : null;
const exportedFile = dir + `/tmp.xlsx`;
const titleStyle = workbook.createStyle({ font: { color: "#000000", size: 12, bold: true } });

const pipFileStream = (res) => {
    workbook.write(exportedFile, (err, stats) => {
        if (!err) {
            var filename = path.basename(exportedFile);
            var mimetype = mime.lookup(exportedFile);
            res.setHeader("Content-disposition", "attachment; filename=" + filename);
            res.setHeader("Content-type", mimetype);
            var filestream = fs.createReadStream(exportedFile);
            filestream.pipe(res);
        } else {
            res.end("An error occured, please refesh this page!");
        }
    });
};

module.exports = {
    downloadAccountExample: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"];
        worksheet.cell(1, 1).string("User Code").style(titleStyle);
        worksheet.cell(1, 2).string("Fullname").style(titleStyle);
        worksheet.cell(1, 3).string("Email").style(titleStyle);
        worksheet.cell(1, 4).string("Phone Number").style(titleStyle);
        worksheet.cell(1, 5).string("Password").style(titleStyle);
        worksheet.cell(1, 6).string("Role").style(titleStyle);
        pipFileStream(res);
    },
    downloadSupplierExample: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"];
        worksheet.cell(1, 1).string("Supplier Code").style(titleStyle);
        worksheet.cell(1, 2).string("Supplier Name").style(titleStyle);
        worksheet.cell(1, 3).string("Adress").style(titleStyle);
        worksheet.cell(1, 4).string("Phone Number").style(titleStyle);
        pipFileStream(res);
    },
    downloadProductExample: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"];
        worksheet.cell(1, 1).string("Barcode").style(titleStyle);
        worksheet.cell(1, 2).string("Product Name").style(titleStyle);
        worksheet.cell(1, 3).string("UOM").style(titleStyle);
        worksheet.cell(1, 4).string("Department").style(titleStyle);
        worksheet.cell(1, 4).string("Supplier Code").style(titleStyle);
        worksheet.cell(1, 4).string("Unit Cost").style(titleStyle);
        pipFileStream(res);
    },
};
