require('../db/connection')
require('dotenv').config()
const key = require('../middle/auth')
const Category = require('../models/category')
const Product = require ('../models/product')
const Order = require('../models/orderHistory')
const router = require('express').Router()
const sendEmail = require('../email/orderMail')

//Bulk insert of Category
router.post('/categorybulkin', key , async(req,res) => {
    try{
        const cat = await req.body
        if(cat.constructor === Array) {
            if(cat.length){
                var err = false
                var dupli = false
                var nameA = []
                var unique = []
                for(let index = 0 ; index < cat.length ; index++){
                    if(!cat[index].name){
                        err = true
                        break
                    }else{
                        if (unique.includes(cat[index].name.toLowerCase())){
                            dupli = true
                            break
                        }
                        else{
                            nameA.push(new RegExp(cat[index].name, 'i'))
                            unique.push(cat[index].name.toLowerCase())
                        }
                    }
                }
                if(!err && !dupli){
                    Category.countDocuments({name : {$in: nameA}} , function(err,count) {
                        if(err){
                            console.log(e)
                            res.status(500).send({ err: 'Internal server error'})
                        }else{
                            if(count == 0) {
                                Category.insertMany(cat , function(err , result) {
                                    if(err){
                                        res.status(400).send({err:'Internal server error'})
                                    }else{
                                        res.status(400).send({ done: 'Insertion of category successgul!'})
                                    }
                                })
                            }else{
                                res.send('Duplicate item found')
                            }
                        }
                    })
                }else{
                    if(err){
                        res.status(400).send('Invalid request')
                    }else{
                        res.status(400).send('Duplicate data found')
                    }
                }

            }else{
                res.status(400).send('Atleast one data should be inserted')
            }
        }else{
                res.status(400).send('Invalid request')
        }

    }catch (e){ 
        res.status(400).send(e)
    }
})

//Bulk insertion of product

router.post('/productbulkin' , key, async(req,res) => {
    try{
        const pro = await req.body
        const idArr = []
        const categoryid = await Category.aggregate([{ "$project": { "_id": 0, "id": "$_id" } }])
        categoryid.forEach(function (cat) {
            idArr.push(cat.id)
        })

        if(pro.constructor === Array){
            if(pro.length){
                var err = false
                var dupli = false
                var sameCatId = false
                var greater = false
                var dbCatId = false
                var length = false
                var count = 0
                for( i = 0; i<pro.length ; i++){
                    if(!pro[i].name || !pro[i].price || !pro[i].cat_id){
                        err = true
                        break
                    }else{
                        if(pro[i].price > 0){
                            if(pro[i].name.length > 3){
                                if(pro[i].cat_id.toString().match(/^[0-9a-zA-Z]{24}$/)){
                                    for (let ix = 0; ix < idArr.length; ix++) {
                                        if (idArr[ix] == pro[i].cat_id) {
                                            count += 1
                                        } else {
                                            continue
                                        }
                                    }
                                    for (let j = i + 1; j < pro.length; j++) {
                                        if ((pro[i].name == pro[j].name) && (pro[i].cat_id == pro[j].cat_id)) {
                                            sameCatId = true
                                        }
                                    }
                                    let cat_id = await pro[i].cat_id
                                    let name = await pro[i].name
                                    let results = await Product.find({ cat_id })

                                    for (let k = 0; k < results.length; k++) {
                                        if (results[k].name == name) {
                                            dbCatId = true
                                        }
                                    }
                                }else{
                                    res.status(400).send('Invalid category id')
                                }
                            }else{
                                length = true
                            }
                        }else{
                            greater = true
                        }
                    }
                }
                if (!(count === pro.length)) {
                    isErr = true
                }

                if (!err && !dupli && !greater && !length && !sameCatId && !dbCatId){
                    Product.insertMany(pro, function(err,result){
                        if(err){
                            res.status(400).send('Internal server Error')
                        }else{
                            res.status(400).send('Insertion of product Successful')
                        }
                    })
                }else{
                    if(dupli){
                        res.status(400).send('Duplicate item') 
                     }else if(greater){
                        res.status(400).send('Product price should be greater than 0')
                     }else if(length){
                        res.status(400).send('Product name should be greater than 3 letters')
                     }else{
                        res.status(400).send('Product must be umique in a category')
                     }
            }
            }else{
                res.status(400).send('Atleast one product required') 
            }
        }else{
            res.status(400).send('Invalid request') 
        }

    }catch(e){
        res.status(400).send(e)
    }
})


//  Insert Order History
router.post('/orderHistory' , key, async(req,res) => {
    try{
     const order = await req.body
     const proArr = []
     const productid = await Product.aggregate([{ "$project" :{"_id": 0, "id":"$_id" }}])
     productid.forEach(function (pro){
         proArr.push(pro.id.toString())
     })

     const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
     if(order.constructor == Object){
         if(reg.test(String(order.usermail).toLowerCase())){
             if(proArr.includes(order.pro_id)){
                 await Order.create(order)
                 res.status(400).send('Order Insertion Successful')
             }else{
                 res.status(400).send('Invalid product id')
             }
         }else{
             res.status(400).send('Invalid mail')
         }
     }else{
         res.status(400).send('Invalid request')
     }
    } catch (e) {
        res.status(400).send(e)
    }
})

// Filteration
// 1. when category and price range are given
// 2. when only category given
// 3. when only price given
// 4. when no parameters are given

router.get('/filteration' , key , async(req,res) => {

   try{
    const para = await req.body
    if(Object.keys(para).length <= 2){
        if(para.cat_id && para.price){
            if(para.price.max >= para.price.min){
                if(para.price.max && para.price.min == ''){
                    Category
                    .find({ _id : cat_id})
                    .populate({
                        path : 'products' , 
                        match : {price : {$lte : para.price.max}}
                    })
                    .exec(function (err , resp){
                        if(err){
                            console.log(err)
                        }else{
                            res.status(400).send(resp)
                        }
                    })
                } else {
                    Category
                    .find({ _id : cat_id})
                    .populate({
                        path : 'products' ,
                        match : {price : {$gte : para.price.min ,$lte : para.price.max}}
                    })
                    .exec(function (err , resp) {
                        if(err){
                            console.log(err)
                        }else{
                            res.status(400).send(resp)
                        }
                    })
                }
            } else if (para.price.min && para.price.max == ''){
                Category
                .find({ _id : cat_id})
                .populate({
                    path : 'products' ,
                    match : {price : {$gte : para.price.min}}
                })
                .exec(function (err,resp){
                    if(err){
                        console.log(err)
                    }else {
                        res.status(400).send(resp)
                    }
                })
            }
        }else if(para.cat_id){
            Category
            .find ({ _id : cat_id})
            .populate({
                path : 'products'
            })
            .exec(function (err,resp) {
                if(err){
                    console.log(err)
                }else {
                    res.status(400).send(resp)
                }
            })
        }else if(para.price){
            Category
            .find({ _id : cat_id })
            .populate({
                path  : 'cat_id'
            })
            .exec (function (err, resp) {
                if(err){
                    console.log(err)
                }else {
                    res.status(400).send(resp)
                }
            })
        }else if(Object.keys(para).length === 0) {
            Category
            .find()
            .populate({
                path : 'products'
            })
            .exec(function (err , resp) {
                if(err){
                    console.log(err)
                }else{
                    res.status(400).send(resp)
                } 
                
            })
        }
    }else {
        res.status(400).send('Invalid parameter request')
    }

   }catch(e){
       res.status(400).send(e)
   }

} )


// show top 2 expensive of each category

router.get( '/mostexpensive' , key, async(req,res) => {
        try{
            Category
            .find()
            .populate({
                path : 'products',
                options : {
                    sort : {
                        price : -1
                    },
                    limit : 2
                }
            })
            .exec(function (err,resp){
                if(err){
                    console.log(err)
                }else {
                    res.status(400).send(resp)
                }
            })
        }catch(e){
            res.status(400).send(e)
        }
})

// last seven days order
 router.get('/sevendays' , key , async(req,res) => {
        const present = new Date()
        try{
            Order
            .find({
                "createdAt" : 
                {$gte : present.getTime() - 1000*60*60*24*7} 
            })
            .populate({
                path: 'pro_id',
                select : 'name' ,
                populate :{
                    path : 'cat_id',
                    select : 'name'
                }
            })
            .exec(function (err,resp) {
                if(err){
                    console.log(err)
                }else{
                    res.status(400).send(resp)
                }
            })

        }catch(e){
            res.status(400).send(e)
        }

 })

//search by name's character
 router.get('/search', key , async (req, res) => {
    try {
        const result = await Product.find({ name: new RegExp(req.body.name, 'i') })
        res.status(200).send(result)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Pagination
router.get('/paginating', key, async (req, res) => {
    try {
        const page = parseInt(req.query.page)
        const limit = 2
        const start = (page - 1) * limit
        const end = page * limit
        const totalOrder = await Order.countDocuments()

        if (end <= totalOrder && start >= 0) {
            const result = await Order.find().limit(limit).skip(start)
            res.status(200).send(result)
        } else {
            res.status(404).send({ err: 'No results' })
        }
    } catch (e) {
        res.status(400).send(e)
    }
})

//sending mail

router.get('/sendMail/:id', key , async (req, res) => {
    try {
        const orderId = await req.params.id
        const order = await Order.find({ _id: orderId })
        const product = await Product.find({ _id: order[0].pro_id })
        const category = await Category.find({ _id: product[0].cat_id })
        sendEmail(order[0], product[0], category[0])
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router

