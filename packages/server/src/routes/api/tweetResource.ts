import { TwitterApi } from "twitter-api-v2";
import { ApiError } from "../../errors/Errors";

export default class TweetResource {

    async getTweets(tweets: string[], token: string): Promise<any> {

        try {
            const client = new TwitterApi(token).v2.readOnly
            const tweetsFromApi = await client.tweets(tweets)
            return tweetsFromApi
        } catch (err: any) {
            throw new ApiError(err)
        }

    }

}