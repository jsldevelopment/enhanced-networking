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
const aws_1 = require("../aws");
const BaseDB_1 = __importDefault(require("./BaseDB"));
class TweetDB extends BaseDB_1.default {
    constructor() {
        super();
        this.tableName = 'Tweet';
    }
    write(tweets) {
        const dataToWrite = tweets.map((tweet) => {
            return {
                PutRequest: {
                    Item: tweet
                }
            };
        });
        aws_1.dynamoDb.batchWrite({
            RequestItems: {
                "Tweet": dataToWrite
            }
        }, (err, data) => {
            if (err)
                console.log(err);
            else
                console.log(data);
        });
    }
    read(author) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                TableName: this.tableName,
                Select: "ALL_ATTRIBUTES",
                KeyConditionExpression: "#author = :author",
                ExpressionAttributeNames: {
                    "#author": "author"
                },
                ExpressionAttributeValues: {
                    ":author": author
                }
            };
            const tweets = yield aws_1.dynamoDb.query(params).promise();
            return tweets.Items;
        });
    }
}
exports.default = TweetDB;
