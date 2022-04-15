const express = require("express");
const app = express();
const {connectMongoose, User }= require("./database");
const ejs = require("ejs");
const passport = require("passport");
const { initializingPassport, isAuthenticated } = require("./passportConfig");
const expressSession = require("express-session");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key:"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"
    }
}));

connectMongoose();

initializingPassport(passport);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(
    expressSession({secret:"secret", resave:false, saveUninitialized:false})
)
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/register",async (req,res)=>{
const user = await User.findOne({username:req.body.username});

if(user) return res.status(400).send("User already exists");

const newUser = await User.create(req.body);
transporter.sendMail({
    to: req.body.username,
    from:'rishabhgupta7210012474@gmail.com',
    subject:'Registered Successfully',
    html:'<h1>You successfully signed up!</h1>'
});
res.status(201).send(newUser).redirect("/login");
})

app.post(
    "/login",
    passport.authenticate("local",{
        failureRedirect:"/register",
        successRedirect:"/",
    })
);

app.get("/profile",isAuthenticated,(req,res)=>{
    res.send(req.user);
});

app.get("/logout", (req,res)=>{
    req.logOut();
    res.redirect("/register");
})

app.listen(3000,()=>{
    console.log("listening to http://localhost:3000");
});