const bcrypt = require("bcrypt");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");
const xlsxFile = require("read-excel-file/node");
const phoneNumberValidator = require("validate-phone-number-node-js");
const accountModel = require("../../models/account");
const adminConfig = require("../../configs/adminConfig");
