const mongoose = require("mongoose");

const UserContext = mongoose.Schema({
    name :{
        type: String,
        require : true
    },
    email : {
        type: String,
        require : true
    },
    username : {
        type:String,
        require :true
    },
    password : {
        type: String,
        require : true
    },
    passwordSalt : {
        type: String,
        require : true
    },
    isDeleted : {
        type: Boolean,
        require : true
    },
    dateCreated : {
        type: Date,
        require : true
    }
});

const User = module.exports = mongoose.model("User",UserContext);