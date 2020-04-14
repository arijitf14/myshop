const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name:{
        type : String,
        require: true,
        minlength: 3
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{
        timestamps : true
    })

categorySchema.set('toObject' , {virtuals:true})
categorySchema.set('toJSON' , {virtuals:true})

//use virtual to refer to the products

categorySchema.virtual('product', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'cat_id'
})

const Category = mongoose.model('Category', categorySchema)
module.exports = Category