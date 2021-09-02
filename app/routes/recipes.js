/************************************************************
 * Title:       recipes.js                                  *
 * Author:      Mike Nystoriak (mnystoriak@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')
const Recipe = require('../models/Recipe')
const units = require('../util/enum')

const router = express.Router()

// get all recipes
router.get('/', async (req, res) => {
    try {
        const results = await Recipe.find()
        return res.status(200).json(results)
    } catch (err) {
        const message = 'Something went wrong...'
        return res.status(500).json({ status: 500, message })
    }
})

// get recipe by ID
router.get('/:id', async (req, res) => {
    try {
        const results = await Recipe.findById(req.params.id)
        return res.status(200).json(results)
    } catch (err) {
        const message = `No recipes returned with ID of "${req.params.id}".`
        const reason = 'Not found.'
        return res.status(404).json({ status: 404, message })
    }
})

/**
 * Parses a quantifiable object from the frontend to
 * the backend.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {object} input Frontend quantifiable.
 * 
 * @returns {object} Backend quantifiable.
 */
const parseToQuantifiable = input => {
    if (input) {
        const { unit } = input
        let numeric = 0
        let readable = ''

        // unit determines whether to set quantity and numeric representation
        if (unit === units.misc.TO_TASTE) {
            readable = ` ${unit}`
        } else {
            const quantity = input.quantity ?? '<undefined>'

            // prepend unit with a space if unit is pieces
            const space = unit === units.misc.PIECES ? ' ' : ''
            readable = `${quantity}${space}${unit}`

            // evaluate the fraction or number
            if (quantity.includes('/')) {
                const parts = quantity.split('/')
                numeric = parts[0] / parts[1]
            } else {
                numeric = parseFloat(quantity)
            }
        }
        return { readable, numeric, unit }
    }
}

// create a recipe
router.post('/', async (req, res) => {
    const recipeBuilder = { ...req.body }

    // build preparation time if it exists
    console.log(req.body.prepTime)
    recipeBuilder.prepTime = parseToQuantifiable(req.body.prepTime)

    // build ingredients if they exist
    if (req.body.ingredients) {
        recipeBuilder.ingredients = req.body.ingredients.map(i => {
            return {
                name: i.name,
                amount: parseToQuantifiable(i.amount)
            }
        })
    }
    const newRecipe = new Recipe(recipeBuilder)

    try {
        await newRecipe.save()
        const message = `The recipe with ObjectID of "${newRecipe._id}" was successfully created.`
        return res.status(201).json({ status: 201, message })
    } catch (err) {
        const message = `The recipe with ObjectID of "${newRecipe._id}" could not be created.`
        const reason = err.message
        return res.status(400).json({ status: 400, message, reason })
    }
})

module.exports = router