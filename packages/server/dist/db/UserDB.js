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
class UserDB extends BaseDB_1.default {
    constructor() {
        super();
        this.tableName = 'Users';
    }
    write(user) {
        return __awaiter(this, void 0, void 0, function* () {
            aws_1.dynamoDb.put({
                "TableName": this.tableName,
                "Item": user
            }, (err, data) => {
                if (err)
                    console.log(err);
            });
        });
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                TableName: this.tableName,
                Select: "ALL_ATTRIBUTES",
                KeyConditionExpression: "#id = :id",
                ExpressionAttributeNames: {
                    "#id": "id"
                },
                ExpressionAttributeValues: {
                    ":id": id
                }
            };
            try {
                const dbResponse = yield aws_1.dynamoDb.query(params).promise();
                return dbResponse.Items ? dbResponse.Items[0] : null;
            }
            catch (err) {
                console.log(`error reading from table ${this.tableName}`);
            }
        });
    }
    update(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                "TableName": this.tableName,
                "Key": { "id": user.id },
                "UpdateExpression": "set #u = :u, #dn = :dn, #img = :img, #e = :e, #up = :up, #f = :f, #b = :b",
                "ExpressionAttributeNames": {
                    "#u": "username",
                    "#dn": "displayName",
                    "#img": "img",
                    "#e": "entities",
                    "#up": "updated",
                    "#f": "follows",
                    "#b": "blocks"
                },
                "ExpressionAttributeValues": {
                    ":u": user.username,
                    ":dn": user.displayName,
                    ":img": user.img,
                    ":e": user.entities,
                    ":up": user.updated,
                    ":f": user.follows,
                    ":b": user.blocks
                }
            };
            const dbResponse = yield aws_1.dynamoDb.update(params).promise();
            return dbResponse.Attributes;
        });
    }
    addBlock(id, blockId) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                "TableName": this.tableName,
                "Key": { id },
                "UpdateExpression": "SET #b = list_append(if_not_exists(#b, :empty_list), :b)",
                "ExpressionAttributeNames": {
                    "#b": "blocks"
                },
                "ExpressionAttributeValues": {
                    ":b": [blockId],
                    ":empty_list": []
                }
            };
            const dbResponse = yield aws_1.dynamoDb.update(params).promise();
            return dbResponse.Attributes;
        });
    }
}
exports.default = UserDB;
