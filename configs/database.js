const database_uri = process.env.DB_URL;
const mongoose = require("mongoose");
const accountModel = require("../models/account");
const adminConfig = require("../configs/adminConfig");

const query = { email: "admin@example.com" },
    update = adminConfig,
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

// Connect to cluster mongoDB
const connect = async function () {
    try {
        const options = { useNewUrlParser: true, useUnifiedTopology: true };
        await mongoose.connect(database_uri, options, () => {
            console.log("✅ Connect to mongoDB successfully!");
        });
    } catch (error) {
        console.log("❌ Failed to connect to MongoDB!");
        console.log(error.message);
    }
};

// Find the document
accountModel.findOneAndUpdate(query, update, options, function (error, result) {
    if (error) {
        console.log("❌ Failed to initial administrator!\n\n");
        console.log({ error });
        return;
    } else {
        console.log("✅ Initial administrator account successfully!\n\n");
    }
});

module.exports = { connect };
