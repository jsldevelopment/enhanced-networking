import { dynamoDb } from '../aws'
import DB from './BaseDB'
import User from '../models/User.model'

export default class UserDB extends DB<User> {

    tableName: string;

    constructor() {
        super()
        this.tableName = 'Users'
    }

    async write(user: User): Promise<void> {

        dynamoDb.put({
            "TableName": this.tableName,
            "Item": user
        }, (err, data) => {
            if (err) console.log(err)
        })
        
    }

    async read(id: string): Promise<any> {
        
        const params = {
            TableName: this.tableName,
            Select: "ALL_ATTRIBUTES",
            KeyConditionExpression: "#id = :id",
            ExpressionAttributeNames:{
                "#id": "id"
            },
            ExpressionAttributeValues: {
                ":id": id
            }
        }
        try {
            const dbResponse = await dynamoDb.query(params).promise()
            return dbResponse.Items ? dbResponse.Items[0] : null
        } catch(err) {
            console.log(`error reading from table ${this.tableName}`)
        }

    }

    async update(user: User): Promise<any> {
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
        }
        const dbResponse = await dynamoDb.update(params).promise()
        return dbResponse.Attributes
    }

    async addBlock(id: string, blockId: string): Promise<any> {
        const params = {
            "TableName": this.tableName,
            "Key": { id },
            "UpdateExpression": "SET #b = list_append(if_not_exists(#b, :empty_list), :b)",
            "ExpressionAttributeNames": {
                "#b": "blocks"
            },
            "ExpressionAttributeValues": {
                ":b": [ blockId ],
                ":empty_list": []
            }
        }
        const dbResponse = await dynamoDb.update(params).promise()
        return dbResponse.Attributes
    }
}