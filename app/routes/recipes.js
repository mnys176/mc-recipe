/************************************************************
 * Title:       recipes.js                                  *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')
const recipe = require('../controllers/recipe')
const { media, sanitize } = require('../middleware/media')
const quickResponse = require('../util/quick-response')

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

// create media for a recipe
router.post(
    '/media/:id',
    recipe.manageMedia,
    media.array('foodImages'),
    async (req, res) => {
        try {
            const sample = req.files[0]
            const destination = sample ? sample.destination : undefined
            const rejects = await sanitize(destination, /image\/(jpeg|png)/)
            return res.status(201).json(rejects)
        } catch (err) {
            return quickResponse(500)
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
            res.json(req.files)
        } catch (err) {
            res.json(err)
        }
    }
)

// delete media for a recipe
router.delete(
    '/media/:id',
    recipe.manageMedia,
    async (req, res) => {
        try {
            // const recipeExists = await recipe.exists(req.params.id)
            // return res.json(recipeExists)
            res.json()
        } catch (err) {
            res.json(err)
        }
    }
)

module.exports = router