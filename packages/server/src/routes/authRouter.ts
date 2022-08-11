import express from 'express'
import 'dotenv/config'
import AuthResource from './api/authResource'
import { UserV2 } from 'twitter-api-v2'
import { ApiError, AuthorizationError, RateLimitError } from '../errors/Errors'
import UserDB from '../db/UserDB'
import User from '../models/User.model'

const authRouter = express.Router()
const authResource = new AuthResource()
const userDB = new UserDB()

/**
 * @http GET
 * @response { url: string }
 * @description generate a new OAuth2 url for authentication
 */
authRouter.get('/url', async (req, res) => {

  try {
    const { url, state, codeVerifier } = await authResource.generateOAuthUrl()
    req.session.state = state
    req.session.codeVerifier = codeVerifier
    res.send({ url })
  } catch (err) {
    res.send(500)
  }

})

/**
 * @http POST
 * @request { code: string, state: string }
 * @description validates parameter code and state against session to fully authenticate user and perform first time user set up
 */
authRouter.post('/authorize', async (req, res) => {

  try {

    const { code, state } = req.body
    const { codeVerifier, state: sessionState } = req.session

    if (!codeVerifier || !state || !sessionState || !code) return res.status(400).send('You denied the app or your session expired!');
    if (state !== sessionState) return res.status(400).send('Stored tokens didnt match!');

    const { accessToken } = await authResource.verifyUserOAuth(code, codeVerifier)
    
    const authUser: UserV2 = await authResource.getCurrentAuthUser(accessToken)

    req.session.accessToken = accessToken
    req.session.userId = authUser.id

    // check for first time login
    const dbUser: User = await userDB.read(authUser.id)

    if (!dbUser) {
      await authResource.firstTimeUserSetup(accessToken, authUser)
    } else {
      // update user timeline && username stuff
      await authResource.returningUserSetup(accessToken, authUser, dbUser)
    }

    req.session.save(() => {
      res.sendStatus(200)
    })

  } catch (err) {
    if (err instanceof ApiError) res.sendStatus(500)
    if (err instanceof RateLimitError) res.sendStatus(500)
    if (err instanceof AuthorizationError) res.sendStatus(401)
  }
    

})


/**
 * @http DELETE
 * @description revokes the users access token and removes all related session data
 */
authRouter.delete('/', async (req, res) => {

  try {
    authResource.revokeAccessToken(req.session.accessToken)
    req.session.userId = undefined
    req.session.accessToken = undefined
    req.session.authors = undefined
    req.session.index = undefined
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof ApiError) res.sendStatus(500)
    else res.sendStatus(500)
  }

})

export default authRouter