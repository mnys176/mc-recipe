/************************************************************
 * Title:       recipes.js                                  *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const fs = require('fs')
const express = require('express')
const recipe = require('../controllers/recipe')

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

// create media for a recipe
// router.post('/media/:id', injectMedia, media.array('foodImages'), (req, res) => {
//     const { id } = req.params
//     res.json(req.files)
// })

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

module.exports = router