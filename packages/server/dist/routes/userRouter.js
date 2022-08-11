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
const router = express_1.default.Router();
const userResource_1 = __importDefault(require("./api/userResource"));
const userResource = new userResource_1.default();
router.use('/', (req, res, next) => {
    if (!req.session.accessToken || !req.session.userId)
        res.sendStatus(403);
    else
        next();
});
/**
 * @http GET
 * @response { userId: string }
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.session.userId || "";
    try {
        const user = yield userResource.getUserFromDB(id);
        res.send(user);
    }
    catch (err) {
        res.sendStatus(500);
    }
}));
/**
 * @http POST
 * @response [{ userId: string }]
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.session.accessToken || "";
    try {
        const user = yield userResource.getUsersFromApi(req.body, token);
        res.send(user);
    }
    catch (err) {
        res.sendStatus(500);
    }
}));
/**
 * @http GET
 * @response { userId: string }
 */
router.get('/follow/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loggedUserId = req.session.userId || "";
    const targetId = req.params.id;
    try {
        const followResult = yield userResource.followUser(loggedUserId, targetId, req.session.accessToken || "");
        res.send(followResult);
    }
    catch (err) {
        res.sendStatus(500);
    }
}));
/**
 * @http GET
 * @response { userId: string }
 */
router.get('/blocks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.userId || "";
    try {
        const blocksResult = yield userResource.getUserBlocks(userId, req.session.accessToken || "");
        res.send(blocksResult);
    }
    catch (err) {
        res.sendStatus(500);
    }
}));
router.post('/blocks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blockId = req.body.id;
    const userId = req.session.userId || "";
    try {
        yield userResource.blockUser(userId, blockId);
        res.send(200);
    }
    catch (err) {
        res.sendStatus(500);
    }
}));
exports.default = router;
