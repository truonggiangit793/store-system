const jwt = require("jsonwebtoken");
const authorization = {
    admin: async (req, res, next) => {
        const token = req.query.token || req.headers["x-access-token"] || null;
        jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
            if (error) {
                console.log("\x1b[31m%s\x1b[0m", error);
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    error: error.message,
                });
            } else {
                console.log("\x1b[36m%s\x1b[0m", "authorization", { payload });
                if (payload.data.role ? payload.data.role.toUpperCase() : null == "ADMIN") {
                    return next();
                } else {
                    return res.status(401).json({
                        status: false,
                        msg: {
                            en: "Permission denied! Only admin is allowed to access this enpoint!",
                            vn: "Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên!",
                        },
                    });
                }
            }
        });
    },
};

module.exports = authorization;
