const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const storageSchema = new mongoose.Schema(
    {
        barcode: {
            type: String,
            required: true,
            unique: true,
        },
        quantity: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

storageSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Storage', storageSchema);
