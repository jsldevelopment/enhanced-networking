"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieSession = exports.dynamoDb = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const express_session_1 = __importDefault(require("express-session"));
const dynamodb_store_1 = __importDefault(require("dynamodb-store"));
require("dotenv/config");
aws_sdk_1.default.config.update({
    region: "us-east-1"
});
// dynamodb
aws_sdk_1.default.config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_ACCESS_SECRET || ""
};
exports.dynamoDb = new aws_sdk_1.default.DynamoDB.DocumentClient();
// session storage
const options = {
    table: 'session',
    dynamoConfig: {
        accessKeyId: aws_sdk_1.default.config.credentials.accessKeyId,
        secretAccessKey: aws_sdk_1.default.config.credentials.secretAccessKey,
        region: 'us-east-1'
    },
    keepExpired: false
};
const sessionCookie = {
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 500000, path: "/", secure: false },
    store: new dynamodb_store_1.default(options)
};
exports.cookieSession = (0, express_session_1.default)(sessionCookie);
