/**************************************************************
 * Title:       http-status.js                                *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)         *
 * Created:     09/17/2021                                    *
 * Description: Set of functions to generalize HTTP handling. *
 **************************************************************/

/**
 * Handles a '404 Not Found' response that occurs when
 * the client requests a non-existent resource.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string} id ID of a requested recipe.
 * 
 * @return {object} An object describing the error.
 */
const handleNotFound = id => {
    const status = 404
    const message = `No recipes returned with ID of "${id}".`
    const reason = 'Not found.'
    return { status, data: { status, message, reason } }
}

/**
 * Handles a '400 Bad Request' response that
 * occurs when the client provides an insufficient
 * body.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string} id     ID of a requested recipe.
 * @param {string} reason The reason the recipe could
 *                        not be created.
 * 
 * @return {object} An object describing the error.
 */
const handleBadRequest = (id, reason) => {
    const status = 400
    const message = `The recipe with ObjectID of "${id}" could not be modified.`
    return { status, data: { status, message, reason } }
}

/**
 * Handles '500 Internal Server Error' response that
 * occurs when an unexpect error occurs server side.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @return {object} An object describing the error.
 */
const handleInternalServerError = () => {
    const status = 500
    const message = 'Something went wrong...'
    const reason = 'Unknown server error.'
    return { status, data: { status, message, reason } }
}

module.exports = {
    handleNotFound,
    handleBadRequest,
    handleInternalServerError
}