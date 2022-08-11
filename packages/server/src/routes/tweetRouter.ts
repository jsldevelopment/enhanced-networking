import express from 'express'
import { ApiError } from '../errors/Errors'
const router = express.Router()
import TweetResource from './api/tweetResource'

const tweetResource = new TweetResource()

router.use('/', (req, res, next) => {
    if (!req.session.accessToken || !req.session.userId) res.sendStatus(403)
    else next()
})

/**
 * @http POST
 * @response tweets: []
 */
 router.post('/', async (req, res) => {

    const token = req.session.accessToken || ""
    try {
        const tweets = await tweetResource.getTweets(req.body, token)
        res.send(tweets)
    } catch (err) {
        if (err instanceof ApiError) res.sendStatus(500)
        else res.sendStatus(500)
    }

})

export default router