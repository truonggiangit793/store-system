const attendanceModel = require("../../models/attendance");
const accountModel = require("../../models/account");

module.exports = {
    attendanceCheckIn: async (req, res, next) => {
        // #swagger.tags = ['Attendance']
        try {
            const userCode = req.body.userCode ? req.body.userCode.toUpperCase() : null;
            const checkIn = new Date();
            const accountQuery = await accountModel.findOne({ userCode });
            if (!userCode)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "User account is required.",
                        vn: "Tài khoản đăng nhập là bắt buộc.",
                    },
                });
            if (accountQuery) {
                const employee = new attendanceModel({ userCode, checkIn });
                employee.save();
                return res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: { en: "Check in successfully!", vn: "Check in thành công." },
                });
            } else {
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "Account does not exist!",
                        vn: "Tài khoản không tồn tại.",
                    },
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                msg: { en: "Interal Server Error" },
                error: error.message,
            });
        }
    },
    attendanceCheckOut: async (req, res, next) => {
        // #swagger.tags = ['Attendance']
        try {
            const userCode = req.body.userCode ? req.body.userCode.toUpperCase() : null;
            const accountQuery = await accountModel.findOne({ userCode });
            const attendanceQuery = await attendanceModel.find({ userCode, checkOut: null });
            if (!userCode)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "User account is required.",
                        vn: "Mã số nhân viên là bắt buộc.",
                    },
                });
            if (!accountQuery)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "Account does not exist!",
                        vn: "Tài khoản không tồn tại.",
                    },
                });
            if (!attendanceQuery || attendanceQuery.length < 0)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "No data.",
                        vn: "Bạn chưa có dữ liệu điểm danh đầu vào nào.",
                    },
                });
            if (attendanceQuery.length > 0) {
                const today = new Date();
                const isCheckinFirts = attendanceQuery.filter((employee) => employee.checkIn.getDay() === today.getDay())[0];
                if (!isCheckinFirts)
                    return res.status(200).json({
                        status: false,
                        statusCode: 200,
                        msg: {
                            en: "This employee does not appear this day!",
                            vn: "Nhân viên chưa có dữ liệu điểm danh hôm nay.",
                        },
                    });
                let totalWorkTime =
                    today.getHours() * 60 + today.getMinutes() - (isCheckinFirts.checkIn.getHours() * 60 + isCheckinFirts.checkIn.getMinutes());
                const hour = Math.floor(totalWorkTime / 60);
                const minute = totalWorkTime % 60;
                totalWorkTime = minute > 50 ? hour + 1 : hour;
                await attendanceModel.findOneAndUpdate(
                    { userCode: isCheckinFirts.userCode, checkIn: isCheckinFirts.checkIn },
                    { checkOut: today, totalWorkTime }
                );
                return res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: {
                        en: "Check out successfully!",
                        vn: "Check out thành công.",
                    },
                });
            } else {
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: {
                        en: "No data.",
                        vn: "Bạn chưa có dữ liệu điểm danh đầu vào nào.",
                    },
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                msg: { en: "Interal Server Error" },
                error: error.message,
            });
        }
    },
    attendanceGetAll: async (req, res, next) => {
        // #swagger.tags = ['Attendance']
        try {
            let data = [];
            const filter = req.query.filter || "all";
            const from = req.query.from || "";
            const to = req.query.to || "";
            const employeeQuery = await attendanceModel.find({});
            if (employeeQuery.length <= 0)
                return res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: { en: "There is no data.", vn: "Danh sách trống, không có dữ liệu nào." },
                    result: [],
                });

            switch (filter) {
                case "all":
                    data = employeeQuery;
                case "day":
                    if (from && to) {
                        if (from.includes("/") && to.includes("/") && from.split("/").length === 3 && to.split("/").length === 3) {
                            const dayFrom = parseInt(from.split("/")[0]) || "";
                            const monthFrom = parseInt(from.split("/")[1]) || "";
                            const YearFrom = parseInt(from.split("/")[2]) || "";

                            const dayTo = parseInt(to.split("/")[0]) || "";
                            const monthTo = parseInt(to.split("/")[1]) || "";
                            const YearTo = parseInt(to.split("/")[2]) || "";
                            if (dayFrom && monthFrom && YearFrom && dayTo && monthTo && YearTo) {
                                employeeQuery.forEach((employee) => {
                                    let dateQuery = employee.checkIn.toISOString().slice(0, 10);
                                    const dayQuery = parseInt(dateQuery.split("-")[2]);
                                    const monthQuery = parseInt(dateQuery.split("-")[1]);
                                    const yearQuery = parseInt(dateQuery.split("-")[0]);
                                    if (yearQuery >= parseInt(YearFrom) && yearQuery <= parseInt(YearTo)) {
                                        if (monthQuery >= parseInt(monthFrom) && monthQuery <= parseInt(monthTo)) {
                                            if (dayQuery >= parseInt(dayFrom) && dayQuery <= parseInt(dayTo)) {
                                                data.push(employee);
                                            }
                                        }
                                    }
                                });
                            } else {
                                return res.status(200).json({
                                    status: false,
                                    statusCode: 200,
                                    msg: {
                                        en: "Please enter time format : dd/mm/year",
                                        vn: "Nhập dữ liệu thời gian với format như sau: dd/mm/year",
                                    },
                                });
                            }
                        } else {
                            return res.status(200).json({
                                status: false,
                                statusCode: 200,
                                msg: {
                                    en: "Please enter time format : dd/mm/year",
                                    vn: "Nhập dữ liệu thời gian với format như sau: dd/mm/year",
                                },
                            });
                        }
                    } else {
                        return res.status(200).json({
                            status: false,
                            statusCode: 200,
                            msg: {
                                en: "Field date from,to are require!",
                                vn: "Vui lòng chọn thời gian bắt đầu và kết thúc",
                            },
                        });
                    }

                default:
            }
            return res.status(200).json({
                status: true,
                statusCode: 200,
                msg: {
                    en: "Get list check in-out employee successfully!",
                    vn: "Lấy danh sách check in-out nhân viên thành công",
                },
                data: data,
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
