"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.DatabaseAccessError = exports.AuthorizationError = exports.EmptyTimelineError = exports.RateLimitError = void 0;
class RateLimitError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class EmptyTimelineError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EmptyTimelineError';
    }
}
exports.EmptyTimelineError = EmptyTimelineError;
class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class DatabaseAccessError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseAccessError';
    }
}
exports.DatabaseAccessError = DatabaseAccessError;
class ApiError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
