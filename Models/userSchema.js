const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    email_verify:{
        type:Boolean
    },
    phone:{
        type:String,
        required:true
    },
    phone_verify:{
        type:Boolean
    },
    aadhar:{
        type:String,
        required:true
    },
    aadhar_verify:{
        type:Boolean
    },
    dob:{
        type:Date,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    pancard:{
        type:String
    },
    address:{
        type:String
    },
    account:{
        type:String
    },
    gst:{
        type:String
    }
})

const users = mongoose.model('users',userSchema)
module.exports = users