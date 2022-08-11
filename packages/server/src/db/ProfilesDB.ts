import { AnyLengthString } from 'aws-sdk/clients/comprehend';
import { dynamoDb } from '../aws'
import DB from './BaseDB'
import Profile from '../models/Profile.model'
import { DatabaseAccessError } from '../errors/Errors';

export default class ProfilesDB extends DB<Profile[]> {

    tableName: string;

    constructor() {
        super()
        this.tableName = 'Authors'
    }

    write(input: Profile[]): void {
        throw new Error('Method not implemented.');
    }

    async read(entity: string) {

        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "#entity = :entity",
            ProjectionExpression: "author, tweets",
            Limit: 750,
            ExpressionAttributeNames:{
                "#entity": "entity"
            },
            ExpressionAttributeValues: {
                ":entity": entity,
            }
        }

        try {
            const dbResponse = await dynamoDb.query(params).promise()
            return dbResponse.Items
        } catch(err: any) {
            throw new DatabaseAccessError(err.msg)
        }

    }

}