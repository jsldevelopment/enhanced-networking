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
const Errors_1 = require("../errors/Errors");
class ProfilesDB extends BaseDB_1.default {
    constructor() {
        super();
        this.tableName = 'Authors';
    }
    write(input) {
        throw new Error('Method not implemented.');
    }
    read(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                TableName: this.tableName,
                KeyConditionExpression: "#entity = :entity",
                ProjectionExpression: "author, tweets",
                Limit: 750,
                ExpressionAttributeNames: {
                    "#entity": "entity"
                },
                ExpressionAttributeValues: {
                    ":entity": entity,
                }
            };
            try {
                const dbResponse = yield aws_1.dynamoDb.query(params).promise();
                return dbResponse.Items;
            }
            catch (err) {
                throw new Errors_1.DatabaseAccessError(err.msg);
            }
        });
    }
}
exports.default = ProfilesDB;
