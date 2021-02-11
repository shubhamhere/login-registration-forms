require('dotenv').config();
require("./db/conn");
const express = require("express");
const app = express();
const path = require("path");
const auth = require("./middleware/auth")
const hbs = require("hbs");

const Register = require("./models/registers")
const { json } = require("express")
const { log } = require("console")
const cookieParser = require('cookie-Parser');
const port = process.env.PORT || 3000;

const bcrypt = require('bcryptjs');
const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")



app.use(express.json())
app.use(express.urlencoded({ extended: false }))//if not using postman
app.use(cookieParser())
app.use(express.static(static_path))
app.set("view engine", "hbs")
app.set("views", template_path)
hbs.registerPartials(partials_path)

console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index")
});
app.get("/secret", auth, (req, res) => {
    console.log(`this is the cookie ${req.cookies.jwt}`);
    res.render("secret")
});
app.get("/register", (req, res) => {
    res.render("register")
});
app.get("/login", (req, res) => {
    res.render("login")
});
app.get("/logout", auth, async (req, res) => {
    try {
        console.log(req.user);
        
        //for single logout we delete that token from database of current recent user
        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token !== req.token
        })

//logout from all devices. ie remove all tokens from database
req.user.tokens=[];
//to remove that cookie on clicking logout
        res.clearCookie("jwt")
        console.log("loggedout sucessfully");
        await req.user.save();
        res.render("login")
    } catch (error) {
        res.status(500).send(error)
    }
});
//create a new user
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword

            })
            //calling token function
            const token = await registerEmployee.generateAuthToken()
            console.log(`the register token is :- ${token}`);
            //the res.cookie() function is used to set cookie name to value
            //the value parameter may be a straing or object converted to JSON
            // res.cookie(name,value,[options])

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 10000000),
                httpOnly: true, //now client cant do anything to our cookie
                secure: true
            })
            console.log(cookie);

            //password hashing using bcrypt
            const registered = await registerEmployee.save();

            res.status(201).render("index")
        } else {
            res.send("password dont match")
        }
    } catch (error) {
        res.status(400).send(error)
        console.log(`the error part is ${error}`);

    }
});

//login validation check
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email })

        const isMatch = await bcrypt.compare(password, useremail.password);//returns true or false

        const token = await useremail.generateAuthToken()

        console.log(`the login token is :- ${token}`);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 10000000),
            httpOnly: true, //now client cant do anything to our cookie
            // secure:true
        })


        if (isMatch) {

            res.status(201).render("index")
        }
        else {
            res.send("invalid password ")
        }

    } catch (error) {
        res.status(400).send("invalid login details")

    }
})
// const bcrypt = require('bcryptjs');
// const securePassword=async(password)=>{
//     const passwordHash=await bcrypt.hash(password,10)
//     console.log(passwordHash);
//     const passwordMatch=await bcrypt.compare(password,passwordHash)
//     console.log(passwordMatch);

// }

const jwt = require('jsonwebtoken');

const createToken = async () => {
    const token = await jwt.sign({ _id: "6024591a507e3a33c00368d4" }, "hsbdhdbdbshnsnsxxnsjdsopqakslmanassnssjkuhssjss",)
    console.log(token);
    const useVer = await jwt.verify(token, "hsbdhdbdbshnsnsxxnsjdsopqakslmanassnssjkuhssjss")
    console.log(useVer);

}
createToken();
app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})