const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser : true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then(() => {
        console.log('Connected to mongodb!')
})
.catch((err) => {
    console.log('Error to connect to db', err)
})