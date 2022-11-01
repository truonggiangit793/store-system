const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const transactionSchema = new mongoose.Schema(
    {
        transactionID: {
            type: String,
            require: true,
            unique: true,
        },
        cashierCode: {
            type: String,
            require: true,
        },
        cashierName: {
            type: String,
            require: true,
        },
        details: {
            type: Object,
            default: [],
        },
        payStatus: {
            type: Boolean,
            default: false,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
        cash: {
            type: Number,
            default: 0,
        },
        changeDue: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

transactionSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("Transaction", transactionSchema);
