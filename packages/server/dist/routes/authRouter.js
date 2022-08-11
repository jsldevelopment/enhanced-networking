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
require("dotenv/config");
const authResource_1 = __importDefault(require("./api/authResource"));
const Errors_1 = require("../errors/Errors");
const UserDB_1 = __importDefault(require("../db/UserDB"));
const authRouter = express_1.default.Router();
const authResource = new authResource_1.default();
const userDB = new UserDB_1.default();
/**
 * @http GET
 * @response { url: string }
 * @description generate a new OAuth2 url for authentication
 */
authRouter.get('/url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url, state, codeVerifier } = yield authResource.generateOAuthUrl();
        req.session.state = state;
        req.session.codeVerifier = codeVerifier;
        res.send({ url });
    }
    catch (err) {
        res.send(500);
    }
}));
/**
 * @http POST
 * @request { code: string, state: string }
 * @description validates parameter code and state against session to fully authenticate user and perform first time user set up
 */
authRouter.post('/authorize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, state } = req.body;
        const { codeVerifier, state: sessionState } = req.session;
        if (!codeVerifier || !state || !sessionState || !code)
            return res.status(400).send('You denied the app or your session expired!');
        if (state !== sessionState)
            return res.status(400).send('Stored tokens didnt match!');
        const { accessToken } = yield authResource.verifyUserOAuth(code, codeVerifier);
        const authUser = yield authResource.getCurrentAuthUser(accessToken);
        req.session.accessToken = accessToken;
        req.session.userId = authUser.id;
        // check for first time login
        const dbUser = yield userDB.read(authUser.id);
        if (!dbUser) {
            yield authResource.firstTimeUserSetup(accessToken, authUser);
        }
        else {
            // update user timeline && username stuff
            yield authResource.returningUserSetup(accessToken, authUser, dbUser);
        }
        req.session.save(() => {
            res.sendStatus(200);
        });
    }
    catch (err) {
        if (err instanceof Errors_1.ApiError)
            res.sendStatus(500);
        if (err instanceof Errors_1.RateLimitError)
            res.sendStatus(500);
        if (err instanceof Errors_1.AuthorizationError)
            res.sendStatus(401);
    }
}));
/**
 * @http DELETE
 * @description revokes the users access token and removes all related session data
 */
authRouter.delete('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        authResource.revokeAccessToken(req.session.accessToken);
        req.session.userId = undefined;
        req.session.accessToken = undefined;
        req.session.authors = undefined;
        req.session.index = undefined;
        res.sendStatus(200);
    }
    catch (err) {
        if (err instanceof Errors_1.ApiError)
            res.sendStatus(500);
        else
            res.sendStatus(500);
    }
}));
exports.default = authRouter;
