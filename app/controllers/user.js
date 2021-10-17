/**********************************************************
 * Title:       user.js                                   *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)     *
 * Created:     09/29/2021                                *
 * Description: Controls the dataflow of user API routes. *
 **********************************************************/

const { userService } = require('../services')

const getAllUsers = async (req, res) => {
    const { status, data } = await userService.fetch()
    return res.status(status).json(data)
}

const getUserById = async (req, res) => {
    const { status, data } = await userService.fetchById(req.params.id)
    return res.status(status).json(data)
}

const postUser = async (req, res) => {
    const { status, data } = await userService.create(req.body)
    return res.status(status).json(data)
}

const putUser = async (req, res) => {
    const { status, data } = await userService.change(req.params.id, req.body)
    return res.status(status).json(data)
}

const deleteUser = async (req, res) => {
    const { status, data } = await userService.discard(req.params.id)
    return res.status(status).json(data)
}

const getUserMedia = async (req, res) => {
    const { id, filename } = req.params
    const { status, data } = await userService.fetchMedia(id, filename)

    if (status === 404) return res.status(status).json(data)
    const file = data.context
    const type = filename.split('.')[1] === 'png' ? 'png' : 'jpeg'
    return res.set('Content-Type', `image/${type}`)
              .status(status)
              .send(file)
}

const postUserMedia = async (req, res) => {
    const { status, data } = await userService.setMedia(req.params.id, req.files)
    return res.status(status).json(data)
}

const putUserMedia = async (req, res) => {
    const { status, data } = await userService.resetMedia(req.params.id, req.files)
    return res.status(status).json(data)
}

const deleteUserMedia = async (req, res) => {
    const { status, data } = await userService.unsetMedia(req.params.id)
    return res.status(status).json(data)
}

module.exports = {
    getAllUsers,
    getUserById,
    postUser,
    putUser,
    deleteUser,
    getUserMedia,
    postUserMedia,
    putUserMedia,
    deleteUserMedia
}