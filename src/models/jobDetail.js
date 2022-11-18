const mongoose = require("mongoose");
const validator = require("validator");

var jobSchema = new mongoose.Schema({
    job_title: {
        type:String, 
        required: true,
    },
	job_description: {
        type:String, 
        required: true
    },
    date:{
        type: Date, 
        default: Date.now 
    }
});

var jobModel = mongoose.model('jobDetail', jobSchema);
module.exports = jobModel;