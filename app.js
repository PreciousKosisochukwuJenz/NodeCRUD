const express = require("express");
const path = require("path");
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const userRoute = require("./routes/user")


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

app.use("/users",userRoute);

// Get request to the starter page
app.get("/",(request,response)=>{
    response.render("index",{
        title: "Home page"
    });
    return;
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

