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
const profilesResource_1 = __importDefault(require("./api/profilesResource"));
// import resources
const profilesResource = new profilesResource_1.default();
router.use('/', (req, res, next) => {
    if (req.session.accessToken && req.session.userId)
        next();
    else
        res.sendStatus(401);
});
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let paginatedAuthors = [];
    const pageSize = parseInt(req.body.pageSize);
    if (!req.session.index || !req.session.authors) {
        console.log(`beginning new session`);
        const authors = yield profilesResource.getProfile(req.session.userId || "", req.body.entityList);
        req.session.authors = authors ? authors : [];
        paginatedAuthors = authors.slice(req.session.index, pageSize);
        req.session.index = pageSize;
    }
    else {
        console.log(`index: ${req.session.index} for authors sized ${req.session.authors.length}`);
        console.log(`fetching new session`);
        paginatedAuthors = req.session.authors.slice(req.session.index, req.session.index + pageSize);
        console.log(`${paginatedAuthors.length}`);
        req.session.index = req.session.index + pageSize;
    }
    console.log(`total authors ${(_b = (_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.authors) === null || _b === void 0 ? void 0 : _b.length}`);
    res.send(paginatedAuthors);
}));
exports.default = router;
