import { TweetContextAnnotationV2 } from "twitter-api-v2"

export default interface Tweet {
    tweet_id: string,
    author: string,
    created: string,
    context: string[] | undefined
}
