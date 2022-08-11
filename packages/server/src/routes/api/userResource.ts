import RateLimitHelper from '../../util/RateLimitHelper'
import { TwitterApiRateLimitPlugin } from '@twitter-api-v2/plugin-rate-limit'
import { RateLimitError, AuthorizationError, DatabaseAccessError, ApiError } from '../../errors/Errors'
import { TwitterApi } from "twitter-api-v2";
import UserDB from '../../db/UserDB';
import User from '../../models/User.model'

export default class UserResource {

    userDB: UserDB = new UserDB()

    async getUserFromDB(id: string): Promise<User> {
        try {
            const user = await this.userDB.read(id)
            return user
        } catch (err) {
            throw new DatabaseAccessError("Failed to read User from DB.")
        }
    }

    async getUserFromApi(id: string, token: string): Promise<any> {

        const client = new TwitterApi(token).v2.readOnly
        const user = await client.user(id)
        return user
    }

    async getUsersFromApi(ids: string[], token: string): Promise<any> {

        const client = new TwitterApi(token).v2.readOnly
        const users = await client.users(ids, {
            "user.fields": ["description"]
        })
        return users
    }

    async followUser(loggedUserId: string, targetId: string, token: string): Promise<any> {

        console.log(`calling followUser with token ${loggedUserId} and id ${targetId}`)
        const client = new TwitterApi(token).v2.readWrite
        try {
            const followResponse = await client.follow(loggedUserId, targetId)
            return followResponse
        } catch (err: any) {
            throw new ApiError(err.message)
        }

    }

    async getUserBlocks(userId: string, token: string): Promise<any> {
        
        console.log(`calling getUserBlocks for user ${userId}`)
        const client = new TwitterApi(token).v2.readWrite
        try {
            const blocksResponse = await client.userBlockingUsers(userId)
            return blocksResponse
        } catch (err: any) {
            throw new ApiError(err.message)
        }
    }

    async blockUser(userId: string, blockId: string): Promise<any> {
        console.log(`adding ${blockId} to ${userId} blocks list`)
        try {
            this.userDB.addBlock(userId, blockId)
        } catch (err) {
            throw new DatabaseAccessError("Failed to read Blocks from DB.")
        }
    }

}