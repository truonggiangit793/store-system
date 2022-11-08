const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const employeeSchema = new mongoose.Schema(
    {
        userCode: {
            type: String,
            require: true,
        },
        salary: {
            type: Number,
            default: 25000,
        },
        timeSheets: {
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

employeeSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("Employee", employeeSchema);
