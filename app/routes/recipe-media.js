/**********************************************************
 * Title:       recipe-media.js                           *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)     *
 * Created:     09/27/2021                                *
 * Description: Set of API routes that pertains to media. *
 **********************************************************/

const express = require('express')
const recipe = require('../controllers/recipe')
const { mediaMulterEngine } = require('../middleware/media-multer')

// include parameters from recipe routes
const router = express.Router({ mergeParams: true })

// group of middlewares for uploading media with Multer
const middlewareList = [
    recipe.prepareMedia,
    mediaMulterEngine.array('foodImages')
]

// get media for a recipe
router.get('/:filename', async (req, res) => {
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
router.post('/', middlewareList, async (req, res) => {
    const { status, data } = await recipe.setMedia(req.params.id, req.files)
    return res.status(status).json(data)
})

// update media for a recipe
router.put('/', middlewareList, async (req, res) => {
    const { status, data } = await recipe.setMedia(req.params.id, req.files)
    return res.status(status).json(data)
})

// delete media for a recipe
router.delete('/', recipe.prepareMedia, async (req, res) => {
    const { status, data } = await recipe.unsetMedia(req.params.id)
    return res.status(status).json(data)
})

module.exports = router