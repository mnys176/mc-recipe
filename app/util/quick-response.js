/******************************************************
 * Title:       quick-response.js                     *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/18/2021                            *
 * Description:                                       *
 *     Set of functions to help controllers package   *
 *     data into a JSON wrapper. The resulting        *
 *     package is designed to be easily portable to   *
 *     an HTTP response.                              *
 ******************************************************/

/**
 * Handles a '200 OK' response that occurs upon a
 * successful transaction.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string|object} message Response payload.
 * @param {string|object} context Additional details if
 *                                desired.
 * 
 * @return {object} A JSON object containing a quick
 *                  response.
 */
const ok = (message = 'OK.', context) => {
    const status = 200
    const package = { status, data: { status, message } }
    if (context) package.data.context = context
    return package
}

/**
 * Handles a '201 Created' response that occurs upon
 * the successful creation of a resource.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string|object} message Response payload.
 * @param {string|object} context Additional details if
 *                                desired.
 * 
 * @return {object} A JSON object containing a quick
 *                  response.
 */
const created = (message = 'Created.', context) => {
    const status = 201
    const package = { status, data: { status, message } }
    if (context) package.data.context = context
    return package
}

/**
 * Handles a '204 No Content' response that occurs when
 * there really isn't anything worth returning to the client.
 * In other words, the request went through, but the server
 * had nothing to do. No body will be sent to the client, but
 * a package will still be created and logged in console.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string|object} message Response payload.
 * @param {string|object} context Additional details if
 *                                desired.
 * 
 * @return {object} A JSON object containing a quick
 *                  response.
 */
const noContent = (message = 'No content.', context) => {
    const status = 204
    const package = { status, data: { status, message } }
    if (context) package.data.context = context
    console.log(JSON.stringify(package))
    return package
}

/**
 * Handles a '400 Bad Request' response that
 * occurs when the client provides an insufficient
 * request body.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string|object} message Response payload.
 * @param {string|object} context Additional details if
 *                                desired.
 * 
 * @return {object} A JSON object containing a quick
 *                  response.
 */
const badRequest = (message = 'Bad request.', context) => {
    const status = 400
    const package = { status, data: { status, message } }
    if (context) package.data.context = context
    return package
}

/**
 * Handles a '404 Not Found' response that occurs when
 * the client requests a non-existent resource.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string|object} message Response payload.
 * @param {string|object} context Additional details if
 *                                desired.
 * 
 * @return {object} A JSON object containing a quick
 *                  response.
 */
const notFound = (message = 'Not found.', context) => {
    const status = 404
    const package = { status, data: { status, message } }
    if (context) package.data.context = context
    return package
}

/**
 * Handles a '500 Internal Server Error' response that
 * occurs when an unexpected error occurs on the
 * server side.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {string|object} message Response payload.
 * @param {string|object} context Additional details if
 *                                desired.
 * 
 * @return {object} A JSON object containing a quick
 *                  response.
 */
const internalServerError = (message = 'Internal server error.', context) => {
    const status = 500
    const package = { status, data: { status, message } }
    if (context) package.data.context = context
    return package
}

/**
 * Generates a quick JSON response for use in REST APIs.
 * If no code is provided, '200 OK' is assumed.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 *
 * @param {number}        code    Status code.
 * @param {string|object} message Optional message that acts as
 *                                the payload.
 * @param {string|object} context Optional information that goes
 *                                into a bit more detail about
 *                                the context.
 * 
 * @return {object} A JSON object containing a quick
 *                  response.
 */
const quickResponse = (code, message, context) => {
    switch (parseInt(code)) {
        case 201: return created(message, context)
        case 204: return noContent(message, context)
        case 400: return badRequest(message, context)
        case 404: return notFound(message, context)
        case 500: return internalServerError(message, context)
        default: return ok(message, context)
    }
}

module.exports = quickResponse