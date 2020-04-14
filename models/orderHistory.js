const mongoose = require('mongoose')

const historySchema = mongoose.Schema({
    usermail:{
        type: String,
        require: true,
        lowercase: true
    }, name:{
        type: String,
        require: true,
        minlength: 3
    },pro_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        require: true
    }
},{
    timestamps: true
})

const Order = mongoose.model('Order' , historySchema )

module.exports = Order