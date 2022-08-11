import { TwitterApiRateLimitPlugin } from '@twitter-api-v2/plugin-rate-limit'
import { TwitterRateLimit } from 'twitter-api-v2'
export default class RateLimitHelper {

    rateLimitPlugin: TwitterApiRateLimitPlugin

    constructor(rateLimitPlugin: TwitterApiRateLimitPlugin) {
        this.rateLimitPlugin = rateLimitPlugin
    }

    get RateLimitPlugin() {
        return this.rateLimitPlugin
    }

    async authUserRateLimit(): Promise<false | void | TwitterRateLimit> {
        return this.rateLimitPlugin.v2.getRateLimit('users/me')
    }

   async userTimelineRateLimit(userId: string): Promise<false | void | TwitterRateLimit> {
        return this.rateLimitPlugin.v2.getRateLimit(`users/:id/tweets`)
    }

}