/************************************************************
 * Title:       recipe.js                                   *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)       *
 * Created:     08/30/2021                                  *
 * Description: Set of API routes that pertain to a recipe. *
 ************************************************************/

const express = require('express')
const { recipeController } = require('../controllers')
const { bounce, authFw } = require('../middleware')
const quickResponse = require('../util/quick-response')

// recipe routes have nested media routes
const recipeRouter = express.Router()
const mediaRouter = express.Router({ mergeParams: true })

// configure authentication firewall
const authConfig = {
    unauthorized: {
        check: (req, res) => req.session.isAuth === undefined,
        handler: (req, res) => {
            const message = 'Please sign in to perform this action.'
            const { status, data } = quickResponse(401, message)
            return res.status(status).json(data)
        }
    },
    forbidden: {
        check: async (req, res) => {
            const { id } = req.params
            const { username } = req.session
            const isCreator = await recipeController.matchCreator(id, username)
            return !isCreator
        },
        handler: (req, res) => {
            const message = 'You are forbidden from performing this action.'
            const { status, data } = quickResponse(403, message)
            return res.status(status).json(data)
        }
    }
}

recipeRouter.get('/', recipeController.getAllRecipes)
recipeRouter.get('/:id', recipeController.getRecipeById)
recipeRouter.post('/', authFw({ ...authConfig, mode: 1 }), recipeController.postRecipe)
recipeRouter.put('/:id', authFw(authConfig), recipeController.putRecipe)
recipeRouter.delete('/:id', authFw(authConfig), recipeController.deleteRecipe)

// include media routes
recipeRouter.use('/:id/media', mediaRouter)

mediaRouter.get('/:filename', recipeController.getRecipeMedia)
mediaRouter.post('/', authFw(authConfig), bounce(/image\/(jpeg|png)/), recipeController.postRecipeMedia)
mediaRouter.put('/', authFw(authConfig), bounce(/image\/(jpeg|png)/), recipeController.putRecipeMedia)
mediaRouter.delete('/', authFw(authConfig), recipeController.deleteRecipeMedia)

module.exports = recipeRouter