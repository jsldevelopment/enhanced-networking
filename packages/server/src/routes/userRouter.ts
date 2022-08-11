import express from 'express'
import { AuthorizationError, RateLimitError, DatabaseAccessError } from '../errors/Errors'
const router = express.Router()
import UserResource from './api/userResource'
import User from '../models/User.model'

const userResource = new UserResource()

router.use('/', (req, res, next) => {
    if (!req.session.accessToken || !req.session.userId) res.sendStatus(403)
    else next()
})

/**
 * @http GET
 * @response { userId: string }
 */
router.get('/', async (req, res) => {
    const id = req.session.userId || ""
    try {
        const user = await userResource.getUserFromDB(id)
        res.send(user)
    } catch (err) {
        res.sendStatus(500)
    }
})

/**
 * @http POST
 * @response [{ userId: string }]
 */
 router.post('/', async (req, res) => {
    const token = req.session.accessToken || ""
    try {
        const user = await userResource.getUsersFromApi(req.body, token)
        res.send(user)
    } catch (err) {
        res.sendStatus(500)
    }
})


/**
 * @http GET
 * @response { userId: string }
 */
 router.get('/follow/:id', async (req, res) => {
    const loggedUserId = req.session.userId || ""
    const targetId = req.params.id
    try {
        const followResult = await userResource.followUser(loggedUserId, targetId, req.session.accessToken || "")
        res.send(followResult)
    } catch (err) {
        res.sendStatus(500)
    }
 })

/**
 * @http GET
 * @response { userId: string }
 */
 router.get('/blocks/:id', async (req, res) => {
    const userId = req.session.userId || ""
    try {
        await userResource.getUserBlocks(userId, req.session.accessToken || "")
        res.sendStatus(200)
    } catch (err) {
        res.sendStatus(500)
    }
})

router.post('/blocks', async (req, res) => {
    const blockId = req.body.id
    const userId = req.session.userId || ""
    try {
        await userResource.blockUser(userId, blockId)
        res.send(200)
    } catch (err) {
        res.sendStatus(500)
    }
})

export default router