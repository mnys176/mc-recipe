/********************************************************
 * Title:       auth-firewall.js                        *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com)   *
 * Created:     11/21/2021                              *
 * Description:                                         *
 *     Middleware to block unauthorized or forbidden    *
 *     actions on specific routes. The user can provide *
 *     full configuration within the `opts` parameter.  *
 ********************************************************/

const quickResponse = require('../util/quick-response')

const defaults = {
    mode: 2,
    unauthorized: {
        check: (req, res) => true,
        handler: (req, res) => {
            const message = 'Please sign in to perform this action.'
            const { status, data } = quickResponse(401, message)
            return res.status(status).json(data)
        }
    },
    forbidden: {
        check: (req, res) => true,
        handler: (req, res) => {
            const message = 'You are forbidden from performing this action.'
            const { status, data } = quickResponse(403, message)
            return res.status(status).json(data)
        }
    }
}

/**
 * Prohibits actions on a route and returns an appropriate response based on
 * configuration.
 * 
 * @author Mike Nystoriak <nystoriakm@gmail.com>
 * 
 * @param {object}        [opts={}]                   - Configuration settings.
 * @param {number|string} [opts.mode]                 - The level of 'strictness'. If
 *                                                      `0`, all authority checking is
 *                                                      disabled. If `1`, it is implied
 *                                                      that the client has the ability
 *                                                      to perform the action after
 *                                                      authenticating into the application.
 *                                                      A value of `2` will enforce the
 *                                                      same condition as `1`, but also
 *                                                      implies that the action is
 *                                                      prohibited regardless of whether
 *                                                      the client is authenticated or not.
 * @param {object}        [opts.unauthorized]         - Configuration for Mode 1 conditions.
 * @param {object}        [opts.unauthorized.check]   - Function that checks authorization.
 * @param {object}        [opts.unauthorized.handler] - Function that determines how to
 *                                                      handle an unauthorized client.
 * @param {object}        [opts.forbidden]            - Configuration for Mode 2 conditions.
 * @param {object}        [opts.forbidden.check]      - Function that checks for forbidden
 *                                                      action.
 * @param {object}        [opts.forbidden.handler]    - Function that determines how to
 *                                                      handle an forbidden action by a
 *                                                      client.
 * 
 * @returns {object} Middleware for the authority check.
 */
const authFw = (opts = {}) => async (req, res, next) => {
    // merge options with defaults
    opts = {
        ...defaults,
        ...opts,
        unauthorized: { ...defaults.unauthorized, ...opts.unauthorized },
        forbidden: { ...defaults.forbidden, ...opts.forbidden }
    }

    const mode = parseInt(opts.mode)
    if (mode <= 0 || mode > 2) return next()

    // user must be authorized to perform the action
    const unauthorizedCheck = opts.unauthorized.check
    const unauthorizedHandler = opts.unauthorized.handler
    if (await unauthorizedCheck(req, res)) return await unauthorizedHandler(req, res)

    if (mode === 2) {
        // user is forbidden from performing the action
        const forbiddenCheck = opts.forbidden.check
        const forbiddenHandler = opts.forbidden.handler
        if (await forbiddenCheck(req, res)) return await forbiddenHandler(req, res)
    }
    return next()
}

module.exports = authFw