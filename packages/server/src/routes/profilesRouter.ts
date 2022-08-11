import express from 'express'
const router = express.Router()
import ProfilesResource from './api/profilesResource' 

// import resources
const profilesResource = new ProfilesResource()

router.use('/', (req, res, next) => {
    if (req.session.accessToken && req.session.userId) next()
    else res.sendStatus(401)
})

router.post('/', async (req, res) => {
    
    let paginatedAuthors = []
    const pageSize = parseInt(req.body.pageSize)
    if (!req.session.index || !req.session.authors) {
        console.log(`beginning new session`)
        const authors = await profilesResource.getProfile(req.session.userId || "", req.body.entityList)
        req.session.authors = authors ? authors : []
        paginatedAuthors = authors.slice(req.session.index, pageSize)
        req.session.index = pageSize
    } else {
        console.log(`index: ${req.session.index} for authors sized ${req.session.authors.length}`)
        console.log(`fetching new session`)
        paginatedAuthors = req.session.authors.slice(req.session.index, req.session.index+pageSize)
        console.log(`${paginatedAuthors.length}`)
        req.session.index = req.session.index + pageSize
    }

    console.log(`total authors ${req?.session?.authors?.length}`)
    res.send(paginatedAuthors)

})

export default router