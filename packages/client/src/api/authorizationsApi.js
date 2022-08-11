// grab oauth2 url from server
export async function generateAuthUrl() {
    let response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/authorizations/url`, {
        credentials: 'include'
    })
    if (!response.ok) return false
    return await response.json()
}

export async function authorizeUser(params) {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/authorizations/authorize`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    })
    if (!response.ok) return false
    return true
}

export async function logoutUser() {
    fetch(`${process.env.REACT_APP_BASE_URL}/api/authorizations/`, {
        method: 'DELETE',
        credentials: 'include'
    })
}