const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

// storage for sessions
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/test',
    collection: 'sessions'
})
const sessionMiddleware = session({
    secret: 'youuuuu',
    store,
    resave: false,
    saveUninitialized: false
})

module.exports = sessionMiddleware