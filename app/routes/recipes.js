/************************************************************
 * Title:       recipes.js                                  *
 * Author:      Mike Nystoriak (mike.nystoriak@sapns2.com)  *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')
const Recipe = require('../models/Recipe')

const router = express.Router()

// get all recipes
router.get('/', async (req, res) => {
    try {
        const results = await Recipe.find()
        return res.status(200).json(results)
    } catch (err) {
        const msg = 'Uh-oh, something went wrong...'
        return res.status(500).json({ status: 500, message: msg })
    }
})

// get recipe by ID
router.get('/:id', async (req, res) => {
    try {
        const results = await Recipe.findById(req.params.id)
        return res.status(200).json(results)
    } catch (err) {
        const msg = `No recipe found with ID of "${req.params.id}".`
        return res.status(404).json({ status: 404, message: msg })
    }
})

module.exports = router