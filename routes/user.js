const { response, request } = require("express");
const express = require("express");
const bcryptjs = require("bcryptjs")
const UserContext = require("../model/User");
const router = express.Router();

router.get("/users/add",(request,response)=>{
    response.render("AddUser",{
        title : "Add user"
    });
    return;
});

router.post('/users/add',(request,response) =>{
    const name = request.body.Name;
    const email = request.body.Email;
    const password = request.body.Password;
    const passwordSalt = request.body.PasswordSalt;

    var model = new UserContext({
        Name : name,
        Email : email,
        Password : password,
        PasswordSalt : passwordSalt
    });
    bcryptjs.genSalt(10,(err,salt)=>{
        bcryptjs.hash(model.Password,salt,(err,hash)=>{
            if(err){
                console.log(err);
            }
            model.password = hash;
            model.passwordSalt = hash;

            model.save((err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log("user added successfully.");
                    response.redirect("/")
                }
            });
        });
    })

});