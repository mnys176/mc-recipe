/************************************************************
 * Title:       recipes.js                                  *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')

const Recipe = require('../models/Recipe')
const {
    extractRecipe,
    handleNotFound,
    objectIdIsValid,
    updateMediaDirectory,
    deleteMediaDirectory
} = require('../util/helper')
const media = require('../middleware/multer')

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
    const { id } = req.params
    try {
        // handle invalid ID
        if (!objectIdIsValid(id)) return res.status(404).json(handleNotFound(id))
        const results = await Recipe.findById(id)

        // handle not found
        if (!results) return res.status(404).json(handleNotFound(id))

        return res.status(200).json(results)
    } catch (err) {
        const message = `No recipes returned with ID of "${id}".`
        const reason = 'Not found.'
        return res.status(404).json({ status: 404, message, reason })
    }
})

// create a recipe
router.post('/', media.array('foodImages'), async (req, res) => {
    const recipeBuilder = extractRecipe(req.body)
    const newRecipe = new Recipe(recipeBuilder)
    try {
        // make sure new recipe is stored properly
        await newRecipe.save()

        updateMediaDirectory(newRecipe._id, req.files)

        const message = `The recipe with ObjectID of "${newRecipe._id}" was successfully created.`
        return res.status(201).json({ status: 201, message })
    } catch (err) {
        const message = `The recipe with ObjectID of "${newRecipe._id}" could not be created.`
        const reason = err.message
        return res.status(400).json({ status: 400, message, reason })
    }
})

// update a recipe
router.put('/:id', media.array('foodImages'), async (req, res) => {
    const { id } = req.params
    try {
        // handle invalid ID
        if (!objectIdIsValid(id)) return res.status(404).json(handleNotFound(id))
        const currRecipe = await Recipe.findById(id)

        // handle not found
        if (!currRecipe) return res.status(404).json(handleNotFound(id))

        const newRecipe = new Recipe(extractRecipe(req.body))

        // map new properties to recipe model
        currRecipe.title = newRecipe.title
        currRecipe.about = newRecipe.about
        currRecipe.category = newRecipe.category
        currRecipe.modifiedOn = Date.now()
        currRecipe.prepTime = newRecipe.prepTime
        currRecipe.ingredients = newRecipe.ingredients
        currRecipe.instructions = newRecipe.instructions

        await currRecipe.save()

        updateMediaDirectory(id, req.files)

        const message = `The recipe with ObjectID of "${id}" was successfully updated.`
        return res.status(200).json({ status: 200, message })
    } catch (err) {
        const message = `The recipe with ObjectID of "${id}" could not be updated.`
        const reason = err.message
        return res.status(400).json({ status: 400, message, reason })
    }
})

// delete a recipe
router.delete('/:id', async (req, res) => {
    const { id } = req.params
    try {
        // handle invalid ID
        if (!objectIdIsValid(id)) return res.status(404).json(handleNotFound(id))
        const results = await Recipe.findByIdAndDelete(id)

        // handle not found
        if (!results) return res.status(404).json(handleNotFound(id))

        deleteMediaDirectory(id)

        const message = `The recipe with ObjectID of "${id}" was successfully deleted.`
        return res.status(200).json({ status: 200, message })
    } catch (err) {
        const message = `The recipe with ObjectID of "${id}" could not be deleted.`
        const reason = err.message
        return res.status(400).json({ status: 400, message, reason })
    }
})

module.exports = router