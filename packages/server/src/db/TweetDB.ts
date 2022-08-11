import { AnyLengthString } from 'aws-sdk/clients/comprehend';
import { dynamoDb } from '../aws'
import DB from './BaseDB'
import Tweet from '../models/Tweet.model'

export default class TweetDB extends DB<Tweet[]> {

    tableName: string;

    constructor() {
        super()
        this.tableName = 'Tweet'
    }

    write(tweets: Tweet[]): void {

        const dataToWrite = tweets.map((tweet) => {
            return {
                PutRequest: {
                    Item: tweet
                }
            }
        })

        dynamoDb.batchWrite({
            RequestItems: {
                "Tweet": dataToWrite
            }
        }, (err, data) => {
            if (err) console.log(err)
            else console.log(data)
        })
        
    }

    async read(author: string): Promise<any> {
        
        const params = {
            TableName: this.tableName,
            Select: "ALL_ATTRIBUTES",
            KeyConditionExpression: "#author = :author",
            ExpressionAttributeNames:{
                "#author": "author"
            },
            ExpressionAttributeValues: {
                ":author": author
            }
        }
        const tweets = await dynamoDb.query(params).promise()
        return tweets.Items

    }

    
}