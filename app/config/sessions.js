const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

// storage for sessions
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/test',
    collection: 'sessions'
})

// configure middleware
const sessionMiddleware = session({
    secret: process.env.COOKIE_SECRET ?? 'i-am-insecure-and-should-not-be-used',

    // cookies expire after one hour
    cookie: { maxAge: 3600000 },

    unset: 'destroy',
    resave: false,
    saveUninitialized: false,
    store,
})

module.exports = sessionMiddleware