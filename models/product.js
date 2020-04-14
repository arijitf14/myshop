const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name:{
        type: String,
        require: true,
        min: [3, 'Name has to be more than 3!'],
        lowerCase: true
        
    },
    isActive: {
        type: Boolean,
        default: true
    },
    cat_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        require: true
    },
    price: {
        type: Number,
        trim: true
    }
},{
    timestamps: true
})



const Product = mongoose.model('Product', productSchema)

module.exports = Product