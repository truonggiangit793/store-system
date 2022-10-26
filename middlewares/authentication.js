const jwt = require("jsonwebtoken");
const accountModel = require("../models/account");

const authentication = async (req, res, next) => {
    const token = req.query.token || req.headers["x-access-token"];
    jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
        if (error) {
            console.log("\x1b[31m%s\x1b[0m", error);
            return res.status(401).json({
                status: false,
                statusCode: 401,
                msg: {
                    en: "Permission denied, access token is invalid.",
                    vn: "Bạn không có quyền truy cập, access_token không hợp lệ.",
                },
            });
        } else {
            console.log("\x1b[36m%s\x1b[0m", "authentication", { payload });
            const accountQuery = await accountModel.findOne({ userCode: payload.data.userCode });
            if (token == accountQuery.access_token) {
                return next();
            } else {
                return res.status(401).json({
                    status: false,
                    statusCode: 401,
                    msg: {
                        en: "Access token is invalid or has been expired, please login again.",
                        vn: "Access_token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.",
                    },
                });
            }
        }
    });
};

module.exports = authentication;
