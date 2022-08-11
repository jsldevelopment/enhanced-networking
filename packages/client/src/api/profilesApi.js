import ApiError from '../error/ApiError'
import AuthError from '../error/AuthError'

export async function getProfiles(entityList, pageSize) {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/profiles/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSize, entityList })
    })
    if (response.ok) return await response.json()
    if (response.status === 403) throw new AuthError("could not authenticate user")
    else throw new ApiError("something went wrong")
}
