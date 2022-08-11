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
const Errors_1 = require("../../errors/Errors");
const twitter_api_v2_1 = require("twitter-api-v2");
const UserDB_1 = __importDefault(require("../../db/UserDB"));
class UserResource {
    constructor() {
        this.userDB = new UserDB_1.default();
    }
    getUserFromDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userDB.read(id);
                return user;
            }
            catch (err) {
                throw new Errors_1.DatabaseAccessError("Failed to read User from DB.");
            }
        });
    }
    getUserFromApi(id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new twitter_api_v2_1.TwitterApi(token).v2.readOnly;
            const user = yield client.user(id);
            return user;
        });
    }
    getUsersFromApi(ids, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new twitter_api_v2_1.TwitterApi(token).v2.readOnly;
            const users = yield client.users(ids, {
                "user.fields": ["description"]
            });
            return users;
        });
    }
    followUser(loggedUserId, targetId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`calling followUser with token ${loggedUserId} and id ${targetId}`);
            const client = new twitter_api_v2_1.TwitterApi(token).v2.readWrite;
            try {
                const followResponse = yield client.follow(loggedUserId, targetId);
                return followResponse;
            }
            catch (err) {
                throw new Errors_1.ApiError(err.message);
            }
        });
    }
    getUserBlocks(userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`calling getUserBlocks for user ${userId}`);
            const client = new twitter_api_v2_1.TwitterApi(token).v2.readWrite;
            try {
                const blocksResponse = yield client.userBlockingUsers(userId);
                return blocksResponse;
            }
            catch (err) {
                throw new Errors_1.ApiError(err.message);
            }
        });
    }
    blockUser(userId, blockId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`adding ${blockId} to ${userId} blocks list`);
            try {
                this.userDB.addBlock(userId, blockId);
            }
            catch (err) {
                throw new Errors_1.DatabaseAccessError("Failed to read Blocks from DB.");
            }
        });
    }
}
exports.default = UserResource;
