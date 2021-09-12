/************************************************************
 * Title:       mongo.js                                    *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/27/2021                                  *
 * Description:                                             *
 *     Establishes a connection to MongoDB. This connection *
 *     is used to execute statements and queries on the     *
 *     database.                                            *
 ************************************************************/

const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const { GridFsStorage } = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')

/**
 * Configures a MongoDB connection using Mongoose and
 * GridFS.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @returns {Promise} Multer middleware as a `Promise`.
 */
const connectToMongoDB = async () => {
    try {
        // had to downgrade Mongoose because the storage engine isn't up to date
        const { connection } = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        // configure GridFS
        const gfs = Grid(connection.db, mongoose.mongo)
        gfs.collection = 'recipes'
        const storage = new GridFsStorage({
            db: connection,
            file: (req, file) => {
                return new Promise((resolve, reject) => {
                    crypto.randomBytes(16, (err, buf) => {
                        if (err) return reject(err)
                        const ext = path.extname(file.originalname)
                        const filename = `${buf.toString('hex')}${ext}`
                        return resolve({ filename, bucketName: gfs.collection })
                    })
                })
            }
        })

        const mongoDomain = `${connection.host}:${connection.port}`
        console.log(`Connection to MongoDB at ${mongoDomain} succeeded!`)
        return multer({ storage })
    } catch (err) {
        throw err
    }
}

const upload = connectToMongoDB()

module.exports = upload