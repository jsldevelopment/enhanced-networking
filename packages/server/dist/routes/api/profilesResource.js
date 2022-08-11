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
const ProfilesDB_1 = __importDefault(require("../../db/ProfilesDB"));
const UserDB_1 = __importDefault(require("../../db/UserDB"));
class AccountsResource {
    constructor() {
        this.profileDB = new ProfilesDB_1.default();
        this.userDB = new UserDB_1.default();
    }
    getProfile(id, entityList) {
        return __awaiter(this, void 0, void 0, function* () {
            entityList = entityList.slice(0, 10);
            const authors = [];
            const user = yield this.userDB.read(id);
            const followers = user.follows;
            const blocks = user.blocks;
            for (const entity of entityList) {
                try {
                    const profiles = yield this.profileDB.read(entity);
                    if (profiles) {
                        console.log(`${profiles.length} profiles found for given entity ${entity}`);
                        profiles.forEach((profile) => {
                            authors.push({ author: profile.author, tweets: [...profile.tweets.slice(0, 3)] });
                        });
                    }
                }
                catch (err) {
                    console.log(err.msg);
                }
            }
            return authors.filter((author) => {
                return !followers.includes(author.author) && !blocks.includes(author.author);
            });
        });
    }
}
exports.default = AccountsResource;
