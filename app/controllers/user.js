/**********************************************************
 * Title:       user.js                                   *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)     *
 * Created:     09/29/2021                                *
 * Description: Controls the dataflow of user API routes. *
 **********************************************************/

const { userService } = require('../services')

/**
 * Gets all users in the database.
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
const getAllUsers = async (req, res) => {
    const { status, data } = await userService.fetch()
    return res.status(status).json(data)
}

/**
 * Gets a single user from the database by its ID.
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
const getUserById = async (req, res) => {
    const { status, data } = await userService.fetchById(req.params.id)
    return res.status(status).json(data)
}

/**
 * Creates a user in the database.
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
const postUser = async (req, res) => {
    const { status, data } = await userService.create(req.body)
    return res.status(status).json(data)
}

/**
 * Updates a user in the database.
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
const putUser = async (req, res) => {
    const { status, data } = await userService.change(req.params.id, req.body)
    return res.status(status).json(data)
}

/**
 * Deletes a user in the database.
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
const deleteUser = async (req, res) => {
    const { status, data } = await userService.discard(req.params.id)
    return res.status(status).json(data)
}

/**
 * Gets an image file from the database that is linked to
 * a user by its unique filename.
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
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

/**
 * Attaches an image to a user (only works when no media is
 * currently linked).
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
const postUserMedia = async (req, res) => {
    const { status, data } = await userService.setMedia(req.params.id, req.files)
    return res.status(status).json(data)
}

/**
 * Changes the image associated with a user,
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
const putUserMedia = async (req, res) => {
    const { status, data } = await userService.resetMedia(req.params.id, req.files)
    return res.status(status).json(data)
}

/**
 * Removes the image associated with a user,
 * 
 * @author Mike Nystoriak (nystoriakm@gmail.com)
 * 
 * @param {object} req Request object from Express.
 * @param {object} res Response object from Express.
 */
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