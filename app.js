const express = require("express");
const path = require("path");
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const bcrypt = require("bcryptjs")

//models
const User = require("./model/User");

// Specifing app port
const PORT = 8070;
// init express
const app = express();

// Connect to db
mongoose.connect("mongodb://localhost/NodeCRUD");
let db = mongoose.connection;

// Check db connection
db.once("open", ()=>{
    console.log("Connected to mongodb")
});

// Check for db error
db.on("error",(error)=>{
    console.log(error);
});

 /* ************************************************************
 * Middle wares
 */

// express session middleware
app.use(session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false,
}));

// express messages middleware
app.use(require('connect-flash')());
app.use((request,response,next)=>{
    response.locals.messages = require('express-messages')(request,response);
    next();
});

// Load view engine
app.set("views",
[
    path.join(__dirname,"/views"),
]);
app.set("view engine","pug");
app.locals.basedir = path.join(__dirname,"views");

// Set static folder
app.use(express.static(path.join(__dirname,"public")));

// body parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// body parse application/json
app.use(bodyParser.json())

// passport config
require("./config/passport")(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*",(request,response,next)=>{
    response.locals.user = request.user || null;
    next();
})


/*
*    Request routes
*/

// Get request to the starter page
app.get("/",(request,response)=>{
    response.render("index",{
        title: "Home page"
    });
    return;
});

// User list route
app.get('/users/', (request,response)=>{
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
app.get("/users/add",(request,response)=>{
    response.render("AddUser",{
        title : "Add user"
    });
    return;
});
app.post('/users/add',(request,response) =>{
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

app.get("/users/edit/:id",(request,response)=>{
    User.findById(request.params.id,(err,user)=>{
        response.render("EditUser",{
            user : user,
            title : "Edit user"
        });
        return;
    });
});

app.post("/users/edit/:id",(request,response)=>{
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

app.delete("/users/delete/:id",(request,response)=>{
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

app.get("/account/login",(request,response)=>{
    response.render("Login",{
        title: "Login"
    });
    return;
});

// Login Process
app.post("/account/login",(request,response,next)=>{
    passport.authenticate("local",{
        successRedirect:"/",
        failureRedirect:"/account/login",
        failureFlash : true
    })(request,response,next);
});

app.get("/account/logout",(request,response)=>{
    request.logOut();
    request.flash("success","You are logged out");
    response.redirect("/account/login");
})


// Listen to server using specified port
app.listen(PORT,()=>{
    console.log(`App connected to server using port: `+ PORT);
});

