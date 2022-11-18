const mongoose = require("mongoose");
const validator = require("validator");

var userSchema = new mongoose.Schema({
    name: {
        type:String, 
        required: true,
        index: {
            unique: true,        
        }
    },
	email: {
        type:String, 
        required: true,
        index: {
            unique: true, 
        },
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email Id")
            }
        }
    },
    password: {
        type:String, 
        required: true
    },
    date:{
        type: Date, 
        default: Date.now 
    }
});

var userModel = mongoose.model('user', userSchema);
module.exports = userModel;