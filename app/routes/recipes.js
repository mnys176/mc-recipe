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
    const results = await Recipe.find()
    res.status(200).json(results)
})

module.exports = router