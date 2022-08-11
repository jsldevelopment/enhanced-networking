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
const plugin_rate_limit_1 = require("@twitter-api-v2/plugin-rate-limit");
const twitter_api_v2_1 = require("twitter-api-v2");
const Errors_1 = require("../../errors/Errors");
const RateLimitHelper_1 = __importDefault(require("../../util/RateLimitHelper"));
const common_1 = require("../../util/common");
const UserDB_1 = __importDefault(require("../../db/UserDB"));
class AuthResource {
    constructor() {
        this.tokens = {
            clientId: process.env.CLIENT_ID || "",
            clientSecret: process.env.CLIENT_SECRET || ""
        };
        this.userDB = new UserDB_1.default();
        this.rateLimitHelper = new RateLimitHelper_1.default(new plugin_rate_limit_1.TwitterApiRateLimitPlugin);
    }
    generateOAuthUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = new twitter_api_v2_1.TwitterApi(this.tokens);
                const callback = process.env.CALLBACK_URL || "";
                return client.generateOAuth2AuthLink(callback, { scope: ['tweet.read', 'users.read', 'follows.read', 'block.read'] });
            }
            catch (err) {
                throw new Errors_1.ApiError(err);
            }
        });
    }
    verifyUserOAuth(code, codeVerifier) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = new twitter_api_v2_1.TwitterApi(this.tokens);
                const callback = process.env.CALLBACK_URL || "";
                return yield client.loginWithOAuth2({ code, codeVerifier, redirectUri: callback });
            }
            catch (err) {
                throw new Errors_1.ApiError(err);
            }
        });
    }
    getCurrentAuthUser(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (accessToken) {
                const rateLimitHelper = new RateLimitHelper_1.default(new plugin_rate_limit_1.TwitterApiRateLimitPlugin);
                const client = new twitter_api_v2_1.TwitterApi(accessToken, { plugins: [rateLimitHelper.rateLimitPlugin] });
                const authUserRateLimit = yield rateLimitHelper.authUserRateLimit();
                if (authUserRateLimit && authUserRateLimit.remaining <= 0)
                    throw new Errors_1.RateLimitError('rate limit reached for users/me');
                const authUser = yield client.v2.me({
                    "user.fields": ["profile_image_url"]
                });
                return authUser.data;
            }
            else {
                throw new Errors_1.AuthorizationError('failed to authenticate active user');
            }
        });
    }
    revokeAccessToken(token) {
        try {
            if (!token)
                return;
            const client = new twitter_api_v2_1.TwitterApi(this.tokens);
            client.revokeOAuth2Token(token, "access_token");
        }
        catch (err) {
            throw new Errors_1.ApiError(err);
        }
    }
    firstTimeUserSetup(accessToken, user) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('beginning first time user setup');
            try {
                const client = new twitter_api_v2_1.TwitterApi(accessToken, { plugins: [this.rateLimitHelper.rateLimitPlugin] });
                const timelineUserRateLimit = yield this.rateLimitHelper.userTimelineRateLimit(user.id);
                if (timelineUserRateLimit && timelineUserRateLimit.remaining <= 0)
                    throw new Errors_1.RateLimitError('rate limit reached for users/:id/tweets');
                const apiTweets = yield (0, common_1.fetchTweets)(user.id, 2000, client);
                const entities = (0, common_1.buildEntityArray)(apiTweets);
                const follows = yield client.v2.following(user.id, { asPaginator: true });
                yield follows.fetchLast(10000);
                const followerIds = follows.data.data.map((follower) => {
                    return follower["id"];
                });
                const blocks = yield client.v2.userBlockingUsers(user.id);
                yield blocks.fetchLast(10000);
                const blocksIds = blocks.data.data.map((blockedUser) => {
                    return blockedUser["id"];
                });
                this.userDB.write({
                    id: user.id,
                    username: user.username,
                    displayName: user.name,
                    updated: Date.now(),
                    img: user.profile_image_url || "",
                    entities: entities,
                    follows: followerIds,
                    blocks: blocksIds
                });
            }
            catch (err) {
                console.log(err);
                throw new Errors_1.ApiError(err.msg);
            }
        });
    }
    returningUserSetup(accessToken, user, dbUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new twitter_api_v2_1.TwitterApi(accessToken, { plugins: [this.rateLimitHelper.rateLimitPlugin] });
            const timelineUserRateLimit = yield this.rateLimitHelper.userTimelineRateLimit(user.id);
            if (timelineUserRateLimit && timelineUserRateLimit.remaining <= 0)
                throw new Errors_1.RateLimitError('rate limit reached for users/:id/tweets');
            // UPDATE ENTITIES
            let entities;
            let updated;
            if ((Date.now() - (7 * 24 * 60 * 60 * 1000)) > dbUser.updated) {
                console.log(`rebuilding user entities list`);
                const apiTweets = yield (0, common_1.fetchTweets)(user.id, 5000, client);
                entities = (0, common_1.buildEntityArray)(apiTweets);
                updated = Date.now();
            }
            else {
                entities = dbUser.entities;
                updated = dbUser.updated;
            }
            // UPDATING FOLLOWERS
            const follows = yield client.v2.following(user.id, { asPaginator: true });
            const newFollowing = [];
            if (follows.data.data) {
                const mostRecentFollower = dbUser.follows ? dbUser.follows[0] : '';
                let followingIdFound = false;
                while (!followingIdFound && !follows.done) {
                    for (let follower of follows.data.data) {
                        if (follower.id === mostRecentFollower) {
                            followingIdFound = true;
                            break;
                        }
                        else {
                            newFollowing.push(follower.id);
                        }
                    }
                    yield follows.next();
                }
            }
            console.log(`${newFollowing.length} new followers added`);
            // only update if counts differ
            const updatedFollows = [...newFollowing, ...dbUser.follows];
            // BLOCKS
            const blocks = yield client.v2.userBlockingUsers(user.id);
            const newBlocks = [];
            if (blocks.data.data) {
                const mostRecentBlock = dbUser.blocks ? dbUser.blocks[0] : '';
                let blocksIdFound = false;
                do {
                    for (let block of blocks.data.data) {
                        if (block.id === mostRecentBlock) {
                            blocksIdFound = true;
                            break;
                        }
                        else {
                            newBlocks.push(block.id);
                        }
                    }
                    yield blocks.next();
                } while (!blocksIdFound && !blocks.done);
                console.log(`${newBlocks.length} new blocks added`);
                // only update if counts differ
            }
            const updatedBlocks = [...newBlocks, ...dbUser.blocks];
            this.userDB.update({
                id: user.id,
                username: user.username,
                displayName: user.name,
                updated: updated,
                img: user.profile_image_url || "",
                entities: entities,
                follows: updatedFollows,
                blocks: updatedBlocks
            });
        });
    }
}
exports.default = AuthResource;
