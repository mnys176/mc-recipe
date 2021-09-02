/************************************************************
 * Title:       mongo.js                                    *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/27/2021                                  *
 * Description:                                             *
 *     Establishes a connection to MongoDB. This connection *
 *     is used to execute statements and queries on the     *
 *     database.                                            *
 ************************************************************/

const mongoose = require('mongoose')

const connectToMongoDB = async () => {
    try {
        const mongoConn = await mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        const mongoDomain = `${mongoConn.connection.host}:${mongoConn.connection.port}`
        console.log(`Connection to MongoDB at ${mongoDomain} succeeded!`)
    } catch (err) {
        throw err
    }
}

module.exports = connectToMongoDB