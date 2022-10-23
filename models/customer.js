const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const customerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
        },
        lastLogin: {
            type: Date,
            default: new Date(),
        },
        password: {
            type: String,
            require: true,
        },
        active: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            default: "staff",
        },
    },
    {
        timestamps: true,
    }
);

customerSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("Customer", customerSchema);
