const xlsxFile = require("read-excel-file/node");

// const productModel = require("../../models/product");
const employeeModel = require("../../models/employee");
const accountModel = require("../../models/account");
const phoneNumberValidator = require("validate-phone-number-node-js");

module.exports = {
   
    
    checkInTime: async (req, res, next) => {
        // #swagger.tags = ['Employee']
        try {
            const userCode = req.body.userCode ? req.body.userCode.toUpperCase() : null;
            const checkIn = new Date();
            const accountQuery = await accountModel.findOne({ userCode });

            
            if (!userCode)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: { en: "User account is required.", vn: "Tài khoản đăng nhập là bắt buộc." },
            });
            if (accountQuery) {
                const employee = new employeeModel({userCode, checkIn})
                employee.save()
                return res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: { en: "Check in successfully!", vn: "Check in thành công." },
                });

            }else{
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: { en: "Account does not exist!", vn: "Tài khoản không tồn tại." },
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
    EmployeeGetAll : async (req, res, next) => {
        // #swagger.tags = ['Employee']
        try {
            const employeeQuery = await employeeModel.find({});
            if(employeeQuery){
                return res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: { en: "Get list employee successfully!", vn: "Lấy danh sách nhân viên thành công" },
                    data : employeeQuery
                });

            }else{
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: { en: "List empty!", vn: "danh sách rỗng" },
                });
            }
        }catch (error) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                msg: { en: "Interal Server Error" },
                error: error.message,
            });
        }
    },
    checkOutTime: async (req, res, next) => {
        // #swagger.tags = ['Employee']
        try {
            const userCode = req.body.userCode ? req.body.userCode.toUpperCase() : null;
            const accountQuery = await accountModel.findOne({ userCode });
            const employeeQuery = await employeeModel.find({ userCode });

            
            if (!userCode)
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: { en: "User account is required.", vn: "Mã số nhân viên là bắt buộc." },
            });
            if (accountQuery) {
                if(employeeQuery){
                    const today = new Date()
                    const getEmployee = employeeQuery.filter((employee) =>{
                        return employee ? employee.checkIn.getDay() === today.getDay() : null
                    })
                    if(getEmployee){
                        const totalWorkTime = today.getHours() - getEmployee[0].checkIn.getHours()
                        await employeeModel.findOneAndUpdate(
                            {userCode : getEmployee[0].userCode, checkIn : getEmployee[0].checkIn},
                            {checkOut : today , totalWorkTime })
                        return res.status(200).json({
                            status: true,
                            statusCode: 200,
                            msg: { en: "Check out successfully!", vn: "Check out thành công." },
                        });
                    } else{
                        return res.status(200).json({
                            status: false,
                            statusCode: 200,
                            msg: { en: "This employee does not appear this day!", vn: "Nhân viên chưa có dữ liệu điểm danh hôm nay." },
                        });
                    }
                }

            }else{
                return res.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: { en: "Account does not exist!", vn: "Tài khoản không tồn tại." },
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
    }
    
};
