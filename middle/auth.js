require('dotenv').config()

const apiAuth = async (req, res, callback) => {
    try {
        const apiKey = req.header('apiKey')
        if (apiKey == process.env.API_SECRET) {
            callback()
        } else {
            throw new Error()
        }
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = apiAuth