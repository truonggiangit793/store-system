const xlsxFile = require("read-excel-file/node");
const checkInOutModel = require("../../models/attendance");
const employeeModel = require("../../models/employee");
const accountModel = require("../../models/account");
const attendanceModel = require("../../models/attendance");
const phoneNumberValidator = require("validate-phone-number-node-js");
const e = require("express");

module.exports = {
    employeeSalaryVisualize: async (req, res, next) => {
        // #swagger.tags = ['Employee']
        try {
            const dateFrom = req.query.dateFrom || "";
            const dateTo = req.query.dateTo || "";
            const validDateFrom = dateFrom.includes("/")
                ? dateFrom.split("/")[2].length == 4
                    ? parseInt(dateFrom.split("/")[0]) > 0 && parseInt(dateFrom.split("/")[0]) <= 31
                        ? dateFrom.split("/")[1] > 0 && dateFrom.split("/")[1] <= 12
                            ? true
                            : false
                        : false
                    : false
                : false;
            const validDateTo = dateTo.includes("/")
                ? dateTo.split("/")[2].length == 4
                    ? parseInt(dateTo.split("/")[0]) > 0 && parseInt(dateTo.split("/")[0]) <= 31
                        ? dateTo.split("/")[1] > 0 && dateTo.split("/")[1] <= 12
                            ? true
                            : false
                        : false
                    : false
                : false;
            if (!dateFrom || !validDateFrom)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "Please confirm what date from, and must be a valid date: DD/MM/YYYY",
                        vn: "Vui lòng xác nhận thời điểm bắt đầu và phải là dữ liệu hợp lệ: DD/MM/YYYY",
                    },
                });
            if (!dateTo || !validDateTo)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "Please confirm the end date, and must be a valid date: DD/MM/YYYY",
                        vn: "Vui lòng xác nhận thời điểm kết thúc và phải là dữ liệu hợp lệ: DD/MM/YYYY",
                    },
                });
            const timeFrom = new Date(parseInt(dateFrom.split("/")[2]), parseInt(dateFrom.split("/")[1]) - 1, parseInt(dateFrom.split("/")[0]), 11, 0, 0);
            const timeTo = new Date(parseInt(dateTo.split("/")[2]), parseInt(dateTo.split("/")[1]) - 1, parseInt(dateTo.split("/")[0]), 11, 0, 0);
            if (timeTo < timeFrom)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "The start date must be lager than the end date.",
                        vn: "Thời điểm kết thúc phải lớn hơn thời điểm bắt đầu.",
                    },
                });
            // Code here=================================================================
            const attendanceQueryAll = await attendanceModel.find({});
            const employeeQueryAll = await employeeModel.find({});
            const userCodeArray = attendanceQueryAll
                .reduce((result, currentObject, currentIndex) => {
                    if (!result.includes(currentObject.userCode)) result.push(currentObject.userCode);
                    return result;
                }, [])
                .map((element) => {
                    return {
                        userCode: element,
                        preSalary: employeeQueryAll.find((e) => e.userCode == element).preSalary,
                    };
                });

            const finalData = userCodeArray.map((element) => {
                let data = attendanceQueryAll.filter((e) => timeFrom <= e.checkIn && e.checkIn <= timeTo && e.userCode === element.userCode);
                let finalWorkTime = data.reduce((result, currentObject, currentIndex) => {
                    return (result += currentObject.totalWorkTime);
                }, 0);
                return {
                    userCode: element.userCode,
                    finalWorkTime,
                    preSalary: element.preSalary,
                    tempSalary: element.preSalary * finalWorkTime,
                    data,
                };
            });

            // Code here=================================================================
            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {
                    en: "",
                    vn: "",
                },
                timeData: {
                    startDate: timeFrom,
                    endDate: timeTo,
                },
                finalData,
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                msg: { en: "Interal Server Error" },
                error: error.message,
            });
        }
    },
};
