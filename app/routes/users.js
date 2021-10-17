/**********************************************************
 * Title:       users.js                                  *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)     *
 * Created:     09/29/2021                                *
 * Description: Set of API routes that pertain to a user. *
 **********************************************************/

const express = require('express')
const { userController } = require('../controllers')
const { bounce } = require('../middleware/bouncer')

// user routes have nested media routes
const userRouter = express.Router()
const mediaRouter = express.Router({ mergeParams: true })

// include media routes
userRouter.use('/:id/media', mediaRouter)

// get all recipes
userRouter.get('/', async (req, res) => {
    const { status, data } = await userController.fetch()
    return res.status(status).json(data)
})

// get user by ID
userRouter.get('/:id', async (req, res) => {
    const { status, data } = await userController.fetchById(req.params.id)
    return res.status(status).json(data)
})

// create a user
userRouter.post('/', async (req, res) => {
    const { status, data } = await userController.create(req.body)
    return res.status(status).json(data)
})

// update a user
userRouter.put('/:id', async (req, res) => {
    const { status, data } = await userController.change(req.params.id, req.body)
    return res.status(status).json(data)
})

// delete a user
userRouter.delete('/:id', async (req, res) => {
    const { status, data } = await userController.discard(req.params.id)
    return res.status(status).json(data)
})

// get media for a user
mediaRouter.get('/:filename', async (req, res) => {
    const { id, filename } = req.params
    const { status, data } = await userController.fetchMedia(id, filename)

    if (status === 404) return res.status(status).json(data)
    const file = data.context
    const type = filename.split('.')[1] === 'png' ? 'png' : 'jpeg'
    return res.set('Content-Type', `image/${type}`)
              .status(status)
              .send(file)
})

// create media for a user
mediaRouter.post('/', bounce(/image\/(jpeg|png)/), async (req, res) => {
    const { status, data } = await userController.setMedia(req.params.id, req.files)
    return res.status(status).json(data)
})

// update media for a user
mediaRouter.put('/', bounce(/image\/(jpeg|png)/), async (req, res) => {
    const { status, data } = await userController.resetMedia(req.params.id, req.files)
    return res.status(status).json(data)
})

// delete media for a user
mediaRouter.delete('/', async (req, res) => {
    const { status, data } = await userController.unsetMedia(req.params.id)
    return res.status(status).json(data)
})

module.exports = userRouter