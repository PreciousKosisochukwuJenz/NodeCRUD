const express = require("express");
const bcrypt = require("bcryptjs")
const User = require("../model/User");
const router = express.Router();


// User list route
router.get('/', (request,response)=>{
    User.find({},(err,users)=>{
        if(err){
            console.log(err)
        }else{
            response.render("Users",{
                users : users,
                title : "User list"
            });
            return;
        }
    })
});

// Adding route files
router.get("/add",(request,response)=>{
    response.render("AddUser",{
        title : "Add user"
    });
    return;
});
router.post('/add',(request,response) =>{
    const name = request.body.name;
    const email = request.body.email;
    const username = request.body.username;
    const password = request.body.password;
    const passwordSalt = request.body.passwordSalt;

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(request.body.password,salt,(err,hash)=>{
            if(err){
                console.log(err);
            }
            let model = new User({
                name : name,
                email : email,
                username : username,
                password : hash,
                dateCreated : Date.now(),
                isDeleted : false,
            });
            model.save((err)=>{
                if(err){
                    console.log(err);
                    request.flash("error", "User failed to add successfully.")
                }
                else{
                    console.log("user added successfully.");
                    request.flash("success", "User added successfully.")
                    response.redirect("/users/")
                }
            });
        });
    })

});

router.get("/edit/:id",(request,response)=>{
    User.findById(request.params.id,(err,user)=>{
        response.render("EditUser",{
            user : user,
            title : "Edit user"
        });
        return;
    });
});

router.post("/users/edit/:id",(request,response)=>{
    const username = request.body.username;
    const email = request.body.email;
    const name = request.body.name;
    const id = request.params.id;

    let query = {_id : id};

    let model = {
        username : username,
        name : name,
        email : email
    };
    User.update(query,model,(err)=>{
        if(err){
            console.log(err)
            request.flash("error", "Save was unsuccessful.")
        }else{
            request.flash("success", "User updated successfully.")
            response.redirect("/users")
        }
    })
})

router.delete("/delete/:id",(request,response)=>{
    let query = {_id : request.params.id};
     User.findById(request.params.id,(err, user)=>{
        User.remove(query,(err)=>{
            if(err){
                console.log(err);
            }
            else{
                response.send("success");
                request.flash("success", "User deleted successfully.")
            }
        });
     });
});


module.exports = router;