/************************************************************
 * Title:       recipes.js                                  *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')
const recipe = require('../controllers/recipe')
const { mediaMulterEngine } = require('../middleware/media-multer')

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
    recipe.prepareMedia,
    mediaMulterEngine.array('foodImages'),
    async (req, res) => {
        const { status, data } = await recipe.setMedia(req.params.id, req.files)
        return res.status(status).json(data)
    }
)

// update media for a recipe
router.put(
    '/media/:id',
    recipe.prepareMedia,
    mediaMulterEngine.array('foodImages'),
    async (req, res) => {
        const { status, data } = await recipe.setMedia(req.params.id, req.files)
        return res.status(status).json(data)
    }
)

// delete media for a recipe
router.delete(
    '/media/:id',
    recipe.prepareMedia,
    async (req, res) => {
        const { status, data } = await recipe.unsetMedia(req.params.id)
        return res.status(status).json(data)
    }
)

module.exports = router