import { Server, Response } from "miragejs";
import AuthError from "../../error/AuthError";
export default new Server({
    routes() {
        this.urlPrefix = process.env.REACT_APP_BASE_URL
        this.namespace = 'api'
        this.timing = 100
        this.get("/authorizations/url", () => {
            return {
                url: 'http://localhost:3000/authenticate'
            }
        })
        this.post("/authorizations/authorize", () => {
            return {
                id: '123',
                username: 'test_user',
                displayName: 'test user',
                updated: Date.now(),
                entities: {}
            }
        })
        this.get("/users", () => {
            return {
                id: '123',
                username: 'test_user',
                displayName: 'test user',
                updated: Date.now(),
                img: "https://pbs.twimg.com/profile_images/1406770109763538950/NwJl8HCe_normal.jpg",
                entities: [
                    { 
                        "entity_id": "4555",
                        "tweets": ["12352", "23523"]
                    },
                    { 
                        "entity_id": "123",
                        "tweets": ["12352", "23523"]
                    },
                    { 
                        "entity_id": "46T423",
                        "tweets": ["12352", "23523"]
                    },
                ]
            }
        })
        this.post("/profiles", () => {
            return [{
                author: "123",
                tweets: ["323", "23523", "532"]
            },{
                author: "123",
                tweets: ["323", "23523", "532"]
            },{
                author: "343",
                tweets: ["323", "23523", "532"]
            },{
                author: "444",
                tweets: ["323", "23523", "532"]
            },{
                author: "1231111",
                tweets: ["323", "23523", "532"]
            },{
                author: "123533",
                tweets: ["323", "23523", "532"]
            }]
        })
        this.post("/users", (schema, request) => {
            console.log(request.requestBody)
            if (request.requestBody === '["123","123"]') {
                console.log('here 2')
                return {data:
                    [
                        {
                            description: "This is the user bio for Test User. Here I will post descriptions of myself.",
                            id: Math.random() * 10000,
                            name: "test_user",
                            username: "Test User 1"
                        },
                        {
                            description: "This is the user bio for Test User. Here I will post descriptions of myself.",
                            id: Math.random() * 10000,
                            name: "test_user",
                            username: "Test User 2"
                        }
                    ]}
                } else  {
                    console.log('here')
                    return { data: [ {
                        description: "This is the user bio for Test User. Here I will post descriptions of myself.",
                        id: Math.random() * 10000,
                        name: "test_user",
                        username: "Test User 3"
                    },
                    {
                        description: "This is the user bio for Test User. Here I will post descriptions of myself.",
                        id: Math.random() * 10000,
                        name: "test_user",
                        username: "Test User 4"
                    }
                    ]}
                }
        })
        this.post("/tweets", () => {
            return {data:
                [
                    {
                        id: '2134221',
                        text: "this is tweet text"
                    }
                ]
            }
        })
        this.get('/users/follow/:id', () => {
            console.log('hit mock follow endpoint')
            return {
                data: {
                        following: true,
                        pending_follow: false
                    }
            }
        })
        this.post('/users/blocks', () => {
            console.log('hit mock block endpoint')
            return new Response(500)
        })

    }
})