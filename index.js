const express = require('express')
const user = require('./router/user')
require('./db/connection')
require('dotenv').config()

const app = express()
const port = process.env.Port


app.use(express.json())
app.use(user)


app.listen(port, () => {
    console.log(`Server is up on ${port}`)
})
