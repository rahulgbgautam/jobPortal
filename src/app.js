const express = require("express");
const app = express();
require("./db/conn");
const path = require("path");
const hbs = require("hbs");
const userModel = require("./models/user");
const jobModel = require("./models/jobDetail");
const bcrypt = require("bcrypt");
const port = process.env.PORT||3000;
var jwt = require('jsonwebtoken');
var ls = require('local-storage');

const static_path = path.join(__dirname,"/public/");
const views_path = path.join(__dirname,"/views");
const layouts_path = path.join(__dirname,"/layouts");

app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",views_path);
hbs.registerPartials(layouts_path);
 

const checkLoginUser = (req,res,next)=> {
    var loginUser = ls.get('loginUser');
    if(loginUser){
        next();
    }else{
        res.redirect('/login')
    }
  }

app.get("/",(req,res) => {
    let user = ls.get('loginUser');
    if(user){
	    res.render("index",{name:user.name})
    }else{
	    res.render("index")
    }
});
app.get("/login",(req,res) => {
	res.render("auth/login")
});
app.post("/loginuser",async(req,res) => {
	try {
        let email = req.body.email;
        let password = req.body.password;
        let user = await userModel.findOne({email:email});
        if(!user){
            res.send("not found")
        }else{
            let isMatch = await bcrypt.compare(password,user.password);
            if(isMatch){
                var getUserID = user._id;
                var token = jwt.sign({ userID: getUserID }, 'loginToken');
                console.log(token)
                console.log(user)
                ls.set('userToken', token);
                ls.set('loginUser', user);
                res.redirect('jobPosters/dashboard')
            }else{
                res.render('auth/login', { title: '', msg:'Password not matched!' });
            }
        }
    } catch (error) {
        
    }
});

app.get("/register",(req,res) => {
	res.render("auth/register")
});

app.get("/contactUs",(req,res) => {
	res.render("contactUs")
});

app.get("/jobPosters/addJob",checkLoginUser,(req,res) => {
	res.render("jobPosters/addJob")
});

app.get("/jobPosters/editJob/:id",checkLoginUser,async (req,res) => {
    try{
        const _id = req.params.id;
        const jobData = await jobModel.findOne({_id:_id});
	    res.render("jobPosters/editJob",{data:jobData})
    }catch(e){
        console.log(`error is ${e}`);
        res.status(400).send(e);
    }
});

app.post("/jobPosters/updateJob/:id",checkLoginUser,async (req,res) => {
    try{
        const _id = req.params.id;
        const updateData = await jobModel.findByIdAndUpdate(_id,req.body,{
			new:true
		});
		res.status(201).redirect('/jobPosters/dashboard');
    }catch(e){
        console.log(`error is ${e}`);
        res.status(400).send(e);
    }
});

app.get("/jobPosters/deleteJob/:id",checkLoginUser,async (req,res) => {
    try{
		const _id = req.params.id;
		const deleteData = await jobModel.findByIdAndDelete(_id);
		res.status(201).redirect('/jobPosters/dashboard');
	}catch(e){
		console.log(`error is ${e}`);
		res.status(500).send(e);
	}
});

app.get("/jobPosters/dashboard",checkLoginUser,async(req,res) => {
    const jobData = await jobModel.find({});
	res.render("jobPosters/dashboard",{data:jobData})
});

app.get("/jobPosters/logout",async(req,res) => {
    ls.remove('userToken');
    ls.remove('loginUser');
	res.redirect('/')
});

app.get("/jobSeekers/dashboard",checkLoginUser,async(req,res) => {
    const jobData = await jobModel.find({});
	res.render("jobSeekers/dashboard",{data:jobData})
});

app.post("/jobPosters/addJobDetails",checkLoginUser,async(req,res) => {
	let jobDetails = new jobModel(req.body);
    await jobDetails.save((err,result)=>{
        if (err){
            console.log(err);
        }
        else{
            console.log(result)
        }
    }) 
    res.redirect('/jobPosters/dashboard')
});

app.post("/registeration",async(req,res) => {
    try {
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;
        let confpassword = req.body.confpassword;
        if(password != confpassword){
            res.render('auth/register', { title: '', msg:'Password not matched!' });
        } else{
            password = bcrypt.hashSync(req.body.password,10);
            let userDetails = new userModel({
                name:name,
                email:email,
                password:password
            });
            await userDetails.save((err,doc)=>{
                if(err) throw err;
                res.render('auth/login', { title: '', msg:'User Registerd Successfully' });
             });        
        }
    } catch (error) {
        res.status(400).send(error)
    }
});

app.listen(port,() => {
    console.log(`Express server started at port : ${port}`);
});