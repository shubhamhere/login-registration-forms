require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path")
const hbs = require("hbs");
require("./db/conn");
const Register = require("./models/registers")
const {json}=require("express")
const {log}=require("console")

const port = process.env.PORT || 3000;

const bcrypt = require('bcryptjs');
const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")



app.use(express.json())
app.use(express.urlencoded({ extended: false }))//if not using postman

app.use(express.static(static_path))
app.set("view engine", "hbs")
app.set("views", template_path)
hbs.registerPartials(partials_path)

console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index")
});
app.get("/register", (req, res) => {
    res.render("register")
});
app.get("/login", (req, res) => {
    res.render("login")
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
 const token=await registerEmployee.generateAuthToken()
            console.log(`the register token is :- ${token}`);
    
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
  
        const token=await useremail.generateAuthToken()
        
        console.log(`the login token is :- ${token}`);

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
    const token = await jwt.sign({ _id: "6024591a507e3a33c00368d4" }, "hsbdhdbdbshnsnsxxnsjdsopqakslmanassnssjkuhssjss", )
    console.log(token);
    const useVer = await jwt.verify(token, "hsbdhdbdbshnsnsxxnsjdsopqakslmanassnssjkuhssjss")
    console.log(useVer);

}
createToken();
app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})