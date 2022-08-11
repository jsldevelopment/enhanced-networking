import { TweetV2 } from 'twitter-api-v2'
import Entity from '../models/Entity.model'
import Tweet from '../models/Tweet.model'
import TweetDB from '../db/TweetDB'
import { ApiError } from '../errors/Errors'

const tweetDB = new TweetDB()

/**
 * TODO: REFACTOR THIS PLEASE
 */
 export async function fetchTweets(id: string, amt: number, client: any): Promise<TweetV2[]> {

    console.log('fetching tweets')

    const timelinePaginator = await client.v2.userTimeline(id, {
        "tweet.fields": ["created_at", "context_annotations"]
    })

    try {
        timelinePaginator.fetchLast()
    
        // filter out tweets w/o context
        const tweets = timelinePaginator.tweets.filter((tweet: TweetV2) => tweet.context_annotations?.length)

        return tweets.slice(0, amt);

    } catch (err: any) {

        throw new ApiError(err.msg)

    }
}


export function buildEntityArray(tweets: TweetV2[]): Entity[] {

    /**
     * INPUT: TweetV2 Array
     * TweetV2 {
     *  id: string,
     *  context_annotations: {
     *      entity: {
     *          id: string    
     *      }
     *    }
     *  }
     * 
     * OUTPUT: Entity[]
     * [
     *  Entity: {
     *      entiity_id: string,
     *      tweets: string[]
     *  }
     * ]
     * 
     */

    console.log('building entity array')
    const tweetMap: { [key: string]: string[] } = {}
    tweets.forEach((tweet) => {
        const entities: string[] | undefined = tweet.context_annotations?.map((context) => {
            return context.entity.id
        })
        entities?.forEach((entity: string) => {
            if (tweetMap[entity]) tweetMap[entity].push(tweet.id)
            else tweetMap[entity] = [tweet.id]
        })
    })

    const entities: Entity[] = Object.entries(tweetMap).map(([key, value]) => {
        return {
            entity_id: key,
            tweets: value
        }
    })

    entities.sort((a, b) => b.tweets.length - a.tweets.length)

    return entities

}

export async function writeTweetsToDb(tweets: Tweet[]) {

    const chunkSize = 25

    const splitArr = tweets.reduce((chunkArr: Tweet[][], item, index) => {
        const chunkIndex = Math.floor(index/chunkSize)
        if (!chunkArr[chunkIndex]) chunkArr[chunkIndex] = []
        chunkArr[chunkIndex].push(item)
        return chunkArr
    }, [])

    splitArr.forEach((arr) => {
        tweetDB.write(arr)
    })

}