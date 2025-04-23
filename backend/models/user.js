import mongoose from 'mongoose';
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        minlength:[2,"Name should be at least 2 characters long"]
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    email:{
        type:String,
        required:[true,"email is required"],
    },
    dob:{
        type:Date,
        required:[true,"Date of birth is required "]
    }
})