import { TwitterApiRateLimitPlugin } from "@twitter-api-v2/plugin-rate-limit";
import { TwitterApi, TwitterApiOAuth2Init, IParsedOAuth2TokenResult, UserV2, TweetV2, UserFollowingV2Paginator, UserBlockingUsersV2Paginator } from "twitter-api-v2";
import { ApiError, AuthorizationError, RateLimitError } from "../../errors/Errors";
import Entity from '../../models/Entity.model'
import RateLimitHelper from "../../util/RateLimitHelper";
import { fetchTweets, buildEntityArray } from '../../util/common'
import UserDB from '../../db/UserDB'
import User from '../../models/User.model'

export default class AuthResource {

    tokens: TwitterApiOAuth2Init = {
        clientId: process.env.CLIENT_ID || "",
        clientSecret: process.env.CLIENT_SECRET || ""
    }

    userDB: UserDB
    rateLimitHelper: RateLimitHelper

    constructor() {
        this.userDB = new UserDB()
        this.rateLimitHelper = new RateLimitHelper(new TwitterApiRateLimitPlugin)
    }
    
    async generateOAuthUrl() {
        try {
            const client = new TwitterApi(this.tokens)
            const callback = process.env.CALLBACK_URL || ""
            return client.generateOAuth2AuthLink(callback, { scope: ['tweet.read', 'users.read', 'follows.read', 'block.read']})
        } catch (err: any) {
            throw new ApiError(err)
        }
    }

    async verifyUserOAuth(code: string, codeVerifier: string): Promise<IParsedOAuth2TokenResult> {

        try {
            const client = new TwitterApi(this.tokens)
            const callback = process.env.CALLBACK_URL || ""
            return await client.loginWithOAuth2({ code, codeVerifier, redirectUri: callback })
        } catch (err: any) {
            throw new ApiError(err)
        }

    }

    async getCurrentAuthUser(accessToken: string): Promise<UserV2> {

        if (accessToken) {
            const rateLimitHelper = new RateLimitHelper(new TwitterApiRateLimitPlugin)
            const client = new TwitterApi(accessToken, { plugins: [rateLimitHelper.rateLimitPlugin] })
            const authUserRateLimit = await rateLimitHelper.authUserRateLimit()
            if (authUserRateLimit && authUserRateLimit.remaining <= 0) throw new RateLimitError('rate limit reached for users/me')
            const authUser =  await client.v2.me({
                "user.fields": ["profile_image_url"]
            })
            return authUser.data
        } else {
            throw new AuthorizationError('failed to authenticate active user')
        }

    }
    
    revokeAccessToken(token: string | undefined) {

        try {
            if (!token) return
            const client = new TwitterApi(this.tokens)
            client.revokeOAuth2Token(token, "access_token")
        } catch (err: any) {
            throw new ApiError(err)
        }
    }

    async firstTimeUserSetup(accessToken: string, user: UserV2) {
        console.log('beginning first time user setup')
        try {

            const client = new TwitterApi(accessToken, { plugins: [this.rateLimitHelper.rateLimitPlugin] })
            const timelineUserRateLimit = await this.rateLimitHelper.userTimelineRateLimit(user.id)
            if (timelineUserRateLimit && timelineUserRateLimit.remaining <= 0) throw new RateLimitError('rate limit reached for users/:id/tweets')
            
            const apiTweets: TweetV2[] = await fetchTweets(user.id, 2000, client)
            const entities = buildEntityArray(apiTweets)

            const follows: UserFollowingV2Paginator = await client.v2.following(user.id, { asPaginator: true })
            await follows.fetchLast(10000)
            const followerIds = follows.data.data.map((follower: UserV2) => {
                return follower["id"]
            })
            const blocks = await client.v2.userBlockingUsers(user.id)
            await blocks.fetchLast(10000)
            const blocksIds = blocks.data.data.map((blockedUser: UserV2) => {
                return blockedUser["id"]
            })

            this.userDB.write({
                id: user.id,
                username: user.username,
                displayName: user.name,
                updated: Date.now(),
                img: user.profile_image_url || "",
                entities: entities,
                follows: followerIds,
                blocks: blocksIds
            })

        } catch (err: any) {
            console.log(err)
            throw new ApiError(err.msg)
        }

    }

    async returningUserSetup(accessToken: string, user: UserV2, dbUser: User): Promise<any> {

        const client = new TwitterApi(accessToken, { plugins: [this.rateLimitHelper.rateLimitPlugin] })
        const timelineUserRateLimit = await this.rateLimitHelper.userTimelineRateLimit(user.id)
        if (timelineUserRateLimit && timelineUserRateLimit.remaining <= 0) throw new RateLimitError('rate limit reached for users/:id/tweets')

        // UPDATE ENTITIES
        let entities: Entity[]
        let updated: number
        if ((Date.now() - (7 * 24 * 60 * 60 * 1000)) > dbUser.updated) {
            console.log(`rebuilding user entities list`)
            const apiTweets: TweetV2[] = await fetchTweets(user.id, 5000, client)
            entities = buildEntityArray(apiTweets)
            updated = Date.now()
        } else {
            entities = dbUser.entities
            updated = dbUser.updated
        }

        // UPDATING FOLLOWERS
        const follows: UserFollowingV2Paginator = await client.v2.following(user.id, { asPaginator: true })
        const newFollowing: string[] = []

        if (follows.data.data) {
            const mostRecentFollower = dbUser.follows ? dbUser.follows[0] : ''
            let followingIdFound = false
            while (!followingIdFound && !follows.done) {
                for (let follower of follows.data.data) {
                    if (follower.id === mostRecentFollower) {
                        followingIdFound = true
                        break
                    } else {
                        newFollowing.push(follower.id)
                    }
                }
                await follows.next()
            }
        }
        
        console.log(`${newFollowing.length} new followers added`)
        // only update if counts differ
        const updatedFollows = [...newFollowing, ...dbUser.follows]

        // BLOCKS
        const blocks: UserBlockingUsersV2Paginator = await client.v2.userBlockingUsers(user.id)
        const newBlocks: string[] = []
        if (blocks.data.data) {
    
            const mostRecentBlock = dbUser.blocks ? dbUser.blocks[0] : ''
            let blocksIdFound = false
            do {
                for (let block of blocks.data.data) {
                    if (block.id === mostRecentBlock) {
                        blocksIdFound = true
                        break
                    } else {
                        newBlocks.push(block.id)
                    }
                }
                await blocks.next()
            } while (!blocksIdFound && !blocks.done) 
            
            console.log(`${newBlocks.length} new blocks added`)
            // only update if counts differ
        }

        const updatedBlocks = [...newBlocks, ...dbUser.blocks]

            
        this.userDB.update({
            id: user.id,
            username: user.username,
            displayName: user.name,
            updated: updated,
            img: user.profile_image_url || "",
            entities: entities,
            follows: updatedFollows,
            blocks: updatedBlocks
        })
    }

}