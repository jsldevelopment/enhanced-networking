import ApiError from '../error/ApiError'
import AuthError from '../error/AuthError'

export async function getCurrentUser() {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users/`, {
        credentials: 'include'
    })
    if (response.ok) return await response.json()
    if (response.status === 403) throw new AuthError("could not authenticate user")
    else throw new ApiError("something went wrong")
}

export async function getUsers(ids) {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids)
    })
    if (response.ok) return (await response.json()).data
    if (response.status === 403) throw new AuthError("could not authenticate user")
    else throw new ApiError("something went wrong")
}

export async function followUser(id) {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users/follow/${id}`, {
        method: 'GET',
        credentials: 'include'
    })
    if (response.ok) return (await response.json()).data
    if (response.status === 403) throw new AuthError("could not authenticate user")
    else throw new ApiError("something went wrong")
}

export async function blockUser(id) {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users/blocks`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    if (response.ok) {
        return true
    } else if (response.status === 403) {
        throw new AuthError("could not authenticate user")
    } else {
        throw new ApiError("something went wrong")
    }
}