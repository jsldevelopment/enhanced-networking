import express from 'express'

// routes
import userRouter from './routes/userRouter'
import authRouter from './routes/authRouter'
import profilesRouter from './routes/profilesRouter'
import tweetRouter from './routes/tweetRouter'

import 'dotenv/config'
import cors from 'cors'
import * as path from 'path';
import { cookieSession } from './aws'

declare module 'express-session' {
    interface SessionData {
      state: string,
      codeVerifier: string,
      accessToken: string,
      userId: string,
      index: number,
      authors: { author: string, tweets: string[] }[]
    }
  }

export const app = express()
app.use(cors({
    origin: process.env.ORIGIN_URL,
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session
app.set('trust proxy', 1)
app.use(cookieSession)

// routes
app.use('/api/authorizations', authRouter)
app.use('/api/users', userRouter)
app.use('/api/profiles', profilesRouter)
app.use('/api/tweets', tweetRouter)

// serve web
app.use('/', express.static(path.join(__dirname, '../../client/build')))

app.get('*', (req, res) => {
    res.sendFile(
        path.resolve(path.join(__dirname, '../../client/build/index.html'))
    );
});

app.listen(process.env.PORT, () => {
    console.log(`app listening @ ${process.env.ORIGIN_URL}/login`)
})