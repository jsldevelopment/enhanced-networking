# Enhanced Networking for Twitter

## Overview

Enhanced Networking for Twitter is a simple application designed to connect end users with accounts outside of what they may normally see within their network. It's goal is to provide an overview of the account, it's relevant tweets, and a simple and easy way to view or hide that profile.

## How?

Twitter users can begin by authenticating via the OAuth2.0 Auth Flow- giving the application access to the following:

1. Reading the users tweets- to help ensure the application can match the user with profiles that would interest them.
2. Reading the users bio- to display current logged in user information.
3. Reading the users following list- to ensure the user is not presented with accounts they already follow.
4. Reading the users blocked list- to ensure the user is not presented with accounts they have blocked or hidden.

On successful authorization, the application will create a profile for the user by evaluating their most recent tweets and determining the contexts that interest them the most. These contexts are determined by Twitter's [context annotations](https://developer.twitter.com/en/docs/twitter-api/annotations/overview). Once the user has had their first time login profile created, they are routed to the main page of the application.

On another server, a [filtered stream](https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/introduction) is running that will monitor and categorize tweets based their context. These tweets are associated to the profile that tweeted them.

On successful login, the application will sort and filter the users contexts, determining their most interested topics. It will then cross reference the users interests with the accounts stored via the filtered stream server, and match 1:1 based on that context. The end result is a paginated list of profiles that the user can browse.

## Stack

- JavaScript/TypeScript
- React
- NodeJS
- AWS DynamoDB

### Scripts

`npm run build` - builds the client and server workspaces
`npm run serve` - serves the client and server on the defined port
`npm run build:serve` - builds and serves the client and server on the defined port
`npm run postinstall` - heroku script for building the application
`npm run start` -  heroku script from running the application
