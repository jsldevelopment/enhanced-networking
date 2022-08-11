import ApiError from '../error/ApiError'
import AuthError from '../error/AuthError'

export async function getTweets(tweets) {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/tweets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tweets)
    })
    if (response.ok) return (await response.json()).data
    if (response.status === 403) throw new AuthError("could not authenticate user")
    else throw new ApiError("something went wrong")
}