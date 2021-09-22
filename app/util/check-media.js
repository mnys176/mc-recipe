/******************************************************
 * Title:       check-media.js                        *
 * Author:      Mike Nystoriak (nystoriakm@gmail.com) *
 * Created:     09/22/2021                            *
 * Description: Ensures the media directory exists.   *
 ******************************************************/

(async () => {
    const { access, mkdir } = require('fs/promises')
    const media = process.env.MEDIA_ROOT
    try {
        await access(media)
    } catch (err) {
        await mkdir(media)
    }
})()