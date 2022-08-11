import AWS from 'aws-sdk'
import session from 'express-session'
import DynamoDBStore from 'dynamodb-store'
import 'dotenv/config'
import { SessionOptions } from 'express-session'

AWS.config.update({
    region: "us-east-1"
});

// dynamodb
AWS.config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_ACCESS_SECRET || ""
}
export const dynamoDb = new AWS.DynamoDB.DocumentClient();

// session storage
const options = {
    table: 'session',
    dynamoConfig: {
        accessKeyId: AWS.config.credentials.accessKeyId,
        secretAccessKey: AWS.config.credentials.secretAccessKey,
        region: 'us-east-1'
    },
    keepExpired: false
}


const sessionCookie: SessionOptions = {
    secret: "keyboard cat", // modify this to process.env
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 500000, path: "/", secure: false },
    store: new DynamoDBStore(options)
}

export const cookieSession = session(sessionCookie)