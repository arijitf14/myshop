const  nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const smtpTransport = require('nodemailer-smtp-transport')
require('dotenv').config()
const options = {
     viewEngine: {
         extname: '.hbs',
        layoutsDir: 'views/email',
        defaultLayout : 'template.hbs',
        partialsDir : 'views/email'
     },
     viewPath: 'views/email',
    extName: '.hbs'
    }

    const sendMail = (order , product , category) => {
    
    
        let transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host : 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.Mail,
            pass: process.env.Password
        }  
    }))

    let date = order.createdAt.getDate()  


    transporter.use('compile', hbs(options))
    transporter.sendMail({
        from: 'arijitf14@gmail.com',
        to: order.usermail,
        subject: 'Details of your order',
        template: 'template',
        context: {
            username : order.name ,
            catName : category.name,
            proName : product.name , 
            price : product.price,
            Date : date
            }
        }, function (error) {
            if(error) {
                console.log(error)
            }else{
            console.log('Mail sent to ' + order.usermail);
            }
        })
    }

module.exports = sendMail