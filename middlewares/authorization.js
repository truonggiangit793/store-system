const jwt = require("jsonwebtoken");
const authorization = {
    verify: async (req, res, next, { role }) => {
        const token = req.body.token || req.query.token || req.headers["x-access-token"] || null;
        try {
            const payload = await jwt.verify(token, process.env.SECRET_KEY);
            if (payload.data && payload.data.role == role) return true;
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    admin: async (req, res, next) => {
        const verified = await authorization.verify(req, res, next, { role: "ADMIN" });
        if (verified) return next();
        return res.json({
            status: false,
            msg: "Permission denied! Only admin is allowed to access this enpoint!",
        });
    },
};

module.exports = authorization;
