"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
// routes
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const profilesRouter_1 = __importDefault(require("./routes/profilesRouter"));
const tweetRouter_1 = __importDefault(require("./routes/tweetRouter"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const path = __importStar(require("path"));
const aws_1 = require("./aws");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: process.env.ORIGIN_URL,
    credentials: true
}));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// session
exports.app.set('trust proxy', 1);
exports.app.use(aws_1.cookieSession);
// routes
exports.app.use('/api/authorizations', authRouter_1.default);
exports.app.use('/api/users', userRouter_1.default);
exports.app.use('/api/profiles', profilesRouter_1.default);
exports.app.use('/api/tweets', tweetRouter_1.default);
// serve web
exports.app.use('/', express_1.default.static(path.join(__dirname, '../../client/build')));
exports.app.get('*', (req, res) => {
    res.sendFile(path.resolve(path.join(__dirname, '../../client/build/index.html')));
});
exports.app.listen(process.env.PORT, () => {
    console.log(`app listening @ ${process.env.ORIGIN_URL}/login`);
});
