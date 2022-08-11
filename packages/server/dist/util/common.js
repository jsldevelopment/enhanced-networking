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
exports.writeTweetsToDb = exports.buildEntityArray = exports.fetchTweets = void 0;
const TweetDB_1 = __importDefault(require("../db/TweetDB"));
const Errors_1 = require("../errors/Errors");
const tweetDB = new TweetDB_1.default();
/**
 * TODO: REFACTOR THIS PLEASE
 */
function fetchTweets(id, amt, client) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('fetching tweets');
        const timelinePaginator = yield client.v2.userTimeline(id, {
            "tweet.fields": ["created_at", "context_annotations"]
        });
        try {
            timelinePaginator.fetchLast();
            // filter out tweets w/o context
            const tweets = timelinePaginator.tweets.filter((tweet) => { var _a; return (_a = tweet.context_annotations) === null || _a === void 0 ? void 0 : _a.length; });
            return tweets.slice(0, amt);
        }
        catch (err) {
            throw new Errors_1.ApiError(err.msg);
        }
    });
}
exports.fetchTweets = fetchTweets;
function buildEntityArray(tweets) {
    /**
     * INPUT: TweetV2 Array
     * TweetV2 {
     *  id: string,
     *  context_annotations: {
     *      entity: {
     *          id: string
     *      }
     *    }
     *  }
     *
     * OUTPUT: Entity[]
     * [
     *  Entity: {
     *      entiity_id: string,
     *      tweets: string[]
     *  }
     * ]
     *
     */
    console.log('building entity array');
    const tweetMap = {};
    tweets.forEach((tweet) => {
        var _a;
        const entities = (_a = tweet.context_annotations) === null || _a === void 0 ? void 0 : _a.map((context) => {
            return context.entity.id;
        });
        entities === null || entities === void 0 ? void 0 : entities.forEach((entity) => {
            if (tweetMap[entity])
                tweetMap[entity].push(tweet.id);
            else
                tweetMap[entity] = [tweet.id];
        });
    });
    const entities = Object.entries(tweetMap).map(([key, value]) => {
        return {
            entity_id: key,
            tweets: value
        };
    });
    entities.sort((a, b) => b.tweets.length - a.tweets.length);
    return entities;
}
exports.buildEntityArray = buildEntityArray;
function writeTweetsToDb(tweets) {
    return __awaiter(this, void 0, void 0, function* () {
        const chunkSize = 25;
        const splitArr = tweets.reduce((chunkArr, item, index) => {
            const chunkIndex = Math.floor(index / chunkSize);
            if (!chunkArr[chunkIndex])
                chunkArr[chunkIndex] = [];
            chunkArr[chunkIndex].push(item);
            return chunkArr;
        }, []);
        splitArr.forEach((arr) => {
            tweetDB.write(arr);
        });
    });
}
exports.writeTweetsToDb = writeTweetsToDb;
