var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var cors = require("cors");
var bodyParser = require('body-parser');
var app = express();

var port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("/public"));
app.get("/", (req,res)=>{
  res.sendFile(__dirname + "/public/index.html");
});
app.use(bodyParser.urlencoded({ extended: false}));

mongoose.connect(process.env.EXERCISE_TRACKER,{useNewUrlParser:true});
mongoose.connection.once("open",()=>{
  console.log("Connection has been made");
}).on("error",(error)=>{
  console.log("error is: " + error);
});

var Schema = mongoose.Schema;
var userSchema = new Schema({
  name: String,
  exercise:[{
    description:String,
    duration:Number,
    date:Date    
  }],  
});
var User = mongoose.model("User",userSchema);

//CREATION OF USER

app.post("/api/exercise/new-user",(req,res,next)=>{
  var newUser = req.body.username;

  User.findOne({"name":newUser},(err,data,next)=>{
    
    var user = "";
    var id = "";
    
    if(err){     
      res.json({"Error":err});
    }  
    
    if(data){      
      user = "USERNAME TAKEN";
      id = "NONE";      
    }else{      
      var newUsername = new User;
      newUsername.name = newUser;      
      newUsername.save((error,dat)=>{
        
        if(error){         
          res.json({"Error":error});          
        }else{          
          console.log("username saved");
        }
        
      });
      
      user = newUser;
      id= newUsername._id
      
    }
    
    res.json({"username":user,"user id":id});

  });
  
});

//CREATION OF EXERCISE

app.post("/api/exercise/add", (req,res)=>{
  
  var id=req.body.userId;
  var description=req.body.description;
  var duration=req.body.duration;
  var date=req.body.date;
  
  User.findById({"_id":id},(err,data,next)=>{
    
    var userDescription = "";
    var userDuration = "";
    var userDate = "";
    var userName = "";
    var userId = "";
    
    if(err){     
      console.log("Error: "+err);
    }  
    
    if(data){      
      userName = data.name;
      userId = data._id;
      data.exercise.description = description;
      data.exercise.duration = duration;
      data.exercise.date = date;
      
      data.save((error,dat)=>{
        if(error){
          console.log("Error saving exercise "+error);
        }
        console.log("exercise saved");
      });
      
      userDescription=data.exercise.description;
      userDuration=data.exercise.duration;
      userDate=data.exercise.date;
      
    }else{           
      userId= "INVALID ID";      
    }
    
    res.json({"username":userName,"user id":userId, "description":userDescription,"duration":userDuration,"date":userDate});

  });
  
  
  
});





app.listen(port,()=>{
  console.log("Everything OK");
});
