/************************************************************
 * Title:       recipes.js                                  *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')
const recipe = require('../controllers/recipe')
const { media } = require('../middleware/media-multer')
const { sanitize } = require('../controllers/media')

const router = express.Router()

// get all recipes
router.get('/', async (req, res) => {
    const { status, data } = await recipe.fetch()
    return res.status(status).json(data)
})

// get recipe by ID
router.get('/:id', async (req, res) => {
    const { status, data } = await recipe.fetchById(req.params.id)
    return res.status(status).json(data)
})

// create a recipe
router.post('/', async (req, res) => {
    const { status, data } = await recipe.create(req.body)
    return res.status(status).json(data)
})

// update a recipe
router.put('/:id', async (req, res) => {
    const { status, data } = await recipe.change(req.params.id, req.body)
    return res.status(status).json(data)
})

// delete a recipe
router.delete('/:id', async (req, res) => {
    const { status, data } = await recipe.discard(req.params.id)
    return res.status(status).json(data)
})

const { readdir, readFile } = require('fs/promises')
const path = require('path')
const quickResponse = require('../util/quick-response')
const mediaPath = '../media'

// // get all media for a recipe
// router.get('/media/:id', async (req, res) => {
//     try {
//         let { status, data } = await recipe.fetchById(req.params.id)
//         const { media } = temp.data.message
//         const files = await readdir(mediaPath)
//         console.log(temp)
//         res.end()
//     } catch (err) {
//         throw err
//     }
// })

// create media for a recipe
router.post(
    '/media/:id',
    recipe.manageMedia,
    media.array('foodImages'),
    async (req, res) => {
        try {
            const destination = req.files ? req.files[0].destination : undefined

            let temp
            if (destination === undefined) {
                const message = `No media to upload for recipe with ID of "${req.params.id}", nothing to do.`
                temp = quickResponse(204, message)
            } else {
                // clean out suspicious files and store names of rejects
                const { cleared, rejected } = await sanitize(destination, /image\/(jpeg|png)/)

                if (rejected.length === req.files.length) {
                    // all files were rejected
                    const message = 'The selected media was unable to be uploaded, nothing to do.'
                    temp = quickResponse(204, message, rejected)
                } else if (rejected.length === 0) {
                    // all files were cleared
                    const message = `The media for recipe with ID of "${req.params.id}" was successfully uploaded.`
                    temp = quickResponse(201, message, cleared)
                } else {
                    // mixed bag
                    const message = 'Some of the selected media was unable to be uploaded.'
                    temp = quickResponse(201, message, { cleared, rejected })
                }
            }
            const { status, data } = temp
            return res.status(status).json(data)
        } catch (err) {
            throw err
            const { status, data } = quickResponse(500)
            return res.status(status).json(data)
        }
    }
)

// update media for a recipe
router.put(
    '/media/:id',
    recipe.manageMedia,
    media.array('foodImages'),
    async (req, res) => {
        try {
            const destination = req.files ? req.files[0].destination : undefined

            let temp
            if (destination === undefined) {
                const message = `No media to upload for recipe with ID of "${req.params.id}", nothing to do.`
                temp = quickResponse(204, message)
            } else {
                // clean out suspicious files and store names of rejects
                const { cleared, rejected } = await sanitize(destination, /image\/(jpeg|png)/)

                if (rejected.length === req.files.length) {
                    // all files were rejected
                    const message = 'The selected media was unable to be uploaded, nothing to do.'
                    temp = quickResponse(204, message, rejected)
                } else if (rejected.length === 0) {
                    // all files were cleared
                    const message = `The media for recipe with ID of "${req.params.id}" was successfully uploaded.`
                    temp = quickResponse(201, message, cleared)
                } else {
                    // mixed bag
                    const message = 'Some of the selected media was unable to be uploaded.'
                    temp = quickResponse(201, message, { cleared, rejected })
                }
            }
            const { status, data } = temp
            return res.status(status).json(data)
        } catch (err) {
            const { status, data } = quickResponse(500)
            return res.status(status).json(data)
        }
    }
)

// delete media for a recipe
router.delete(
    '/media/:id',
    recipe.manageMedia,
    (req, res) => {
        try {
            const message = `The media for recipe with ID of "${req.params.id}" was successfully deleted.`
            const { status, data } = quickResponse(200, message)
            return res.status(status).json(data)
        } catch (err) {
            const { status, data } = quickResponse(500)
            return res.status(status).json(data)
        }
    }
)

module.exports = router