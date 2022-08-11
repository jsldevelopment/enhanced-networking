"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Errors_1 = require("../errors/Errors");
const router = express_1.default.Router();
const tweetResource_1 = __importDefault(require("./api/tweetResource"));
const tweetResource = new tweetResource_1.default();
router.use('/', (req, res, next) => {
    if (!req.session.accessToken || !req.session.userId)
        res.sendStatus(403);
    else
        next();
});
/**
 * @http POST
 * @response tweets: []
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.session.accessToken || "";
    try {
        const tweets = yield tweetResource.getTweets(req.body, token);
        res.send(tweets);
    }
    catch (err) {
        if (err instanceof Errors_1.ApiError)
            res.sendStatus(500);
        else
            res.sendStatus(500);
    }
}));
exports.default = router;
