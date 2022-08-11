export class RateLimitError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'RateLimitError'
    }
}

export class EmptyTimelineError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'EmptyTimelineError'
    }
}

export class AuthorizationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'AuthorizationError'
    }
}

export class DatabaseAccessError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'DatabaseAccessError'
    }
}

export class ApiError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ApiError'
    }
}