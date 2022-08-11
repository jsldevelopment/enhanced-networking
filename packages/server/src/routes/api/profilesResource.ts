import ProfileDB from '../../db/ProfilesDB'
import UserDB from '../../db/UserDB'

export default class AccountsResource {

    profileDB: ProfileDB
    userDB: UserDB

    constructor() {
        this.profileDB = new ProfileDB()
        this.userDB = new UserDB()
    }
    
    async getProfile(id: string, entityList: string[]): Promise<any> {
        entityList = entityList.slice(0,10)
        const authors: { author: string, tweets: string[] }[] = []
        const user = await this.userDB.read(id)
        const followers = user.follows
        const blocks = user.blocks
        for (const entity of entityList) {
            try {
                const profiles = await this.profileDB.read(entity)
                if (profiles) {
                    console.log(`${profiles.length} profiles found for given entity ${entity}`)
                    profiles.forEach( ( profile ) => {
                        authors.push({ author: profile.author, tweets: [...profile.tweets.slice(0,3) ] })
                    })
                }
            } catch (err: any) {
                console.log(err.msg)
            }
        }
        return authors.filter((author) => {
            return !followers.includes(author.author) && !blocks.includes(author.author)
        })
    }

}