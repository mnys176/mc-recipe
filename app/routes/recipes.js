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
        const msg = 'Something went wrong...'
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

const parseToQuantifiable = input => {
    const { quantity, unit } = input

    let numeric = 0
    if (quantity.includes('/')) {
        const parts = quantity.split('/')
        numeric = parts[0] / parts[1]
    } else {
        numeric = parseFloat(quantity)
    }
    return {
        readable: `${quantity}${unit}`,
        numeric,
        unit
    }
}

// create a recipe
router.post('/', async (req, res) => {
    const recipeBuilder = { ...req.body }

    // build preparation time
    recipeBuilder.prepTime = parseToQuantifiable(req.body.prepTime)

    // build ingredients
    recipeBuilder.ingredients = req.body.ingredients.map(i => {
        return {
            name: i.name,
            amount: parseToQuantifiable(i.amount)
        }
    })
    const newRecipe = new Recipe(recipeBuilder)

    try {
        await newRecipe.save()
        const msg = `The recipe with ObjectID of "${newRecipe._id}" was successfully created.`
        return res.status(201).json({ status: 201, message: msg })
    } catch (err) {
        const msg = `The recipe with ObjectID of "${newRecipe._id}" could not be created.`
        return res.status(400).json({ status: 400, message: msg })
    }
})

module.exports = router