const xlsxFile = require("read-excel-file/node");

// const productModel = require("../../models/product");
const checkInOutModel = require("../../models/checkInOut");
const accountModel = require("../../models/account");
const phoneNumberValidator = require("validate-phone-number-node-js");

module.exports = {
  checkInTime: async (req, res, next) => {
    // #swagger.tags = ['Check in - out']
    try {
      const userCode = req.body.userCode
        ? req.body.userCode.toUpperCase()
        : null;
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
        const employee = new checkInOutModel({ userCode, checkIn });
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
  CheckInOutGetAll: async (req, res, next) => {
    // #swagger.tags = ['Check in - out']
    try {
      const filter = req.query.filter || "all";
      const from = req.query.from || "";
      const to = req.query.to || "";
      const employeeQuery = await checkInOutModel.find({});
      let data = [];
      if (employeeQuery) {
        switch (filter) {
          case "all":
            data = employeeQuery;
          case "day":
            if (from && to) {
              if(from.includes("/") && to.includes("/") && from.split("/").length ===3 && to.split("/").length ===3){

                  const dayFrom = parseInt(from.split("/")[0]) || "";
                  const monthFrom = parseInt(from.split("/")[1]) || "";
                  const YearFrom = parseInt(from.split("/")[2]) || "";
    
                  const dayTo = parseInt(to.split("/")[0]) || "";
                  const monthTo = parseInt(to.split("/")[1]) || "";
                  const YearTo = parseInt(to.split("/")[2]) || "";
                  if(dayFrom && monthFrom && YearFrom && dayTo && monthTo && YearTo){
                      employeeQuery.forEach((employee) => {
                        let dateQuery = employee.checkIn.toISOString().slice(0, 10);
                        const dayQuery = parseInt(dateQuery.split("-")[2]);
                        const monthQuery = parseInt(dateQuery.split("-")[1]);
                        const yearQuery = parseInt(dateQuery.split("-")[0]);
                        if (
                          yearQuery >= parseInt(YearFrom) &&
                          yearQuery <= parseInt(YearTo)
                        ) {
                          if (
                            monthQuery >= parseInt(monthFrom) &&
                            monthQuery <= parseInt(monthTo)
                          ) {
                            if (
                              dayQuery >= parseInt(dayFrom) &&
                              dayQuery <= parseInt(dayTo)
                            ) {
                              data.push(employee);
                            }
                          }
                        }
                    });
                  }else{
                    return res.status(200).json({
                        status: false,
                        statusCode: 200,
                        msg: {
                          en: "Please enter time format : dd/mm/year",
                          vn: "Nhập dữ liệu thời gian với format như sau: dd/mm/year",
                        },
                      });
                  }
              }else {
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
      } else {
        return res.status(200).json({
          status: false,
          statusCode: 200,
          msg: { en: "List empty!", vn: "danh sách rỗng" },
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
  checkOutTime: async (req, res, next) => {
    // #swagger.tags = ['Check in - out']
    try {
      const userCode = req.body.userCode
        ? req.body.userCode.toUpperCase()
        : null;
      const accountQuery = await accountModel.findOne({ userCode });
      const employeeQuery = await checkInOutModel.find({ userCode });

      if (!userCode)
        return res.status(200).json({
          status: false,
          statusCode: 200,
          msg: {
            en: "User account is required.",
            vn: "Mã số nhân viên là bắt buộc.",
          },
        });
      if (accountQuery) {
        if (employeeQuery) {
          const today = new Date();
          const getEmployee = employeeQuery.filter((employee) => {
            return employee
              ? employee.checkIn.getDay() === today.getDay()
              : null;
          });
          if (getEmployee) {
            const totalWorkTime =
              Math.floor((today.getMinutes() - getEmployee[0].checkIn.getMinutes())/60);
            await checkInOutModel.findOneAndUpdate(
              {
                userCode: getEmployee[0].userCode,
                checkIn: getEmployee[0].checkIn,
              },
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
                en: "This employee does not appear this day!",
                vn: "Nhân viên chưa có dữ liệu điểm danh hôm nay.",
              },
            });
          }
        }
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
  CaculateTimeKeeping: async (req, res, next) => {
    // #swagger.tags = ['Check in - out']
    try {
      const dataDay = req.body.dataDay || null;
      const dataMonth = req.body.dataMonth || null;
      const accountQuery = await accountModel.findOne({ userCode });
      const employeeQuery = await checkInOutModel.find({ userCode });

      if (!userCode)
        return res.status(200).json({
          status: false,
          statusCode: 200,
          msg: {
            en: "User account is required.",
            vn: "Mã số nhân viên là bắt buộc.",
          },
        });
      if (accountQuery) {
        if (employeeQuery) {
          const today = new Date();
          const getEmployee = employeeQuery.filter((employee) => {
            return employee
              ? employee.checkIn.getDay() === today.getDay()
              : null;
          });
          if (getEmployee) {
            const totalWorkTime =
              today.getHours() - getEmployee[0].checkIn.getHours();
            await checkInOutModel.findOneAndUpdate(
              {
                userCode: getEmployee[0].userCode,
                checkIn: getEmployee[0].checkIn,
              },
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
                en: "This employee does not appear this day!",
                vn: "Nhân viên chưa có dữ liệu điểm danh hôm nay.",
              },
            });
          }
        }
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
};
