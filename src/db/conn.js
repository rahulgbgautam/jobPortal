const mongoose = require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/blog_management_system",{
	useNewUrlParser:true,
	useUnifiedTopology:true,
	// useCreateIndex:true
}).then(()=>{
	console.log("connection success");
}).catch((e)=>{
	console.log(`connection failed due to ${e}`);
});