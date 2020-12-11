const express = require('express');
const cors = require('cors');
const Datastore = require('nedb');
const app = express();

const PORT = 3000;
const db = new Datastore({
    filename: 'data.db',
    autoload: true
});


// listening on port 3000
app.listen(PORT,()=>console.log('Listening on ',PORT));

// middlewares
app.use(cors());	
app.use(express.static('public'));
app.use(express.json());

// routes
// load basic data upon loading the homepage!
app.get('/showDetails',(req,res)=>{
	db.find({}, function (err, data) {
		if(err){
				res.json({
					message:'fail in db!'
				});
				return
		}
		else{
				res.json({
					message : 'success',
					data : data
				});
		}
	});
});


// adding subject data to the database!
app.post('/addSubject',(req,res)=>{
	let data = req.body;
	let name = data.name;
	let totalQuestions = data.totalQuestions;
	let attemptedQuestions = data.attemptedQuestions;
	let correctQuestions = data.correctQuestions;
	

	if(name.length !== 0 && totalQuestions.length !== 0 && attemptedQuestions.length !==0 && correctQuestions.length !==0){
		db.insert(data,(err,response)=>{
			if(err){
				res.json({
					message:'fail in db!'
				});
				return
			}
			else{
				res.json({
					message : 'success',
					response : response
				});
			}
		});
	}else{
		res.json({
			message : 'fail'
		});
	}
});