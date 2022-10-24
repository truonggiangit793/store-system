const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
    const token = req.query.token || req.headers["x-access-token"];
    try {
        const payload = await jwt.verify(token, process.env.SECRET_KEY);
        if (payload.data) return next();
        return res.json({
            status: false,
            msg: "Permission denied! Invalid token",
        });
    } catch (error) {
        return res.json({
            status: false,
            msg: "Permission denied!",
            err: {
                name: "Params error",
                message: "Token must be provied.",
            },
        });
    }
};

module.exports = authentication;
