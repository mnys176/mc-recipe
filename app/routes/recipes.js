/************************************************************
 * Title:       recipes.js                                  *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')
const recipe = require('../controllers/recipe')
const { mediaMulterEngine } = require('../middleware/media-multer')

const path = require('path')

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

// get media for a recipe
router.get('/:id/media/:filename', async (req, res) => {
    const { id, filename } = req.params
    const { status, data } = await recipe.fetchMedia(id, filename)

    if (status === 404) return res.status(status).json(data)
    const file = data.context
    const type = filename.split('.')[1] === 'png' ? 'png' : 'jpeg'
    return res.set('Content-Type', `image/${type}`)
              .status(status)
              .send(file)
})

// create media for a recipe
router.post(
    '/:id/media',
    recipe.prepareMedia,
    mediaMulterEngine.array('foodImages'),
    async (req, res) => {
        const { status, data } = await recipe.setMedia(req.params.id, req.files)
        return res.status(status).json(data)
    }
)

// update media for a recipe
router.put(
    '/:id/media',
    recipe.prepareMedia,
    mediaMulterEngine.array('foodImages'),
    async (req, res) => {
        const { status, data } = await recipe.setMedia(req.params.id, req.files)
        return res.status(status).json(data)
    }
)

// delete media for a recipe
router.delete(
    '/:id/media',
    recipe.prepareMedia,
    async (req, res) => {
        const { status, data } = await recipe.unsetMedia(req.params.id)
        return res.status(status).json(data)
    }
)

module.exports = router