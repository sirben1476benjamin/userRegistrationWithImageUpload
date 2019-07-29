var express = require('express');
var bodyParser = require('body-parser');
var mongo = require("mongoose");
const fs = require('fs');
const path = require('path');
var ba64 = require("base64-to-image");

var app = express()
app.use(bodyParser.json());
app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({extended:true}));

const userFiles = 'uploads/';
app.use('/uploads', express.static(process.cwd() + '/uploads'));


var db = mongo.connect("mongodb://localhost:27017/AngularSevenCRUD", function(err, response){
  if(err){
    //console.log( err);
  }
  else{
    //console.log('Connected to ' + db, ' + ', response);
  }
});

app.use(function(req, res, next) { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});


var Schema = mongo.Schema;

var IuserSchema = new Schema({
  UserName: { type: String   },
  EmailId: { type: String   },
  Gender: { type: String  },
  Address: { type: String  },
  MobileNo: { type: String  },
  PinCode: { type: String  },
  created: { type: Date, default: Date.now },
  updated_at: {type: Date, default: Date.now},
  image: { type: String , default:'' },
},{ versionKey: false });

var model = mongo.model('iuser', IuserSchema, 'iuser');

app.post("/Api/UserAPI/addEmployee", function(req,res){
  var datetimestamp = Date.now();
  var base64Str = req.body.file;
  var filePath = userFiles;
  var fileName = datetimestamp+req.body.MobileNo;
  var optionalObj = {'fileName': fileName, 'type':'jpg'};
  ba64(base64Str,filePath,optionalObj);
  //var imageInfo = ba64(base64Str,filePath,optionalObj);
  req.body.image = 'uploads/'+fileName + '.jpg';
   var mod = new model(req.body);
    mod.save(function(err,data){
      if(err){
        res.send(err);
      }
      else {
        res.send(data);
        //res.send({data:"Record has been Inserted..!!"});
      }
  });

})

app.put("/Api/UserAPI/updateEmployee/:id",function(req,res){
  console.log(req.body);
  const  dateTimeStamp = Date.now();
  var fileName = dateTimeStamp + req.body.MobileNo;
  if(req.body.file !== null) {
    const base64Str = req.body.file;
    const filePath = userFiles;
    var optionalObj = {'fileName': fileName, 'type': 'jpg'};
    ba64(base64Str, filePath, optionalObj);
  }
  if(req.body.file !== null) {
    req.body.image = 'uploads/' + fileName + '.jpg';
  }else{
    req.body.image =  req.body.imagePath;
  }
  var mod = new model(req.body);
     model.findByIdAndUpdate(req.params.id, { UserName: req.body.UserName, EmailId: req.body.EmailId,
       Address: req.body.Address, MobileNo: req.body.MobileNo, PinCode: req.body.PinCode, updated_at: req.body.updated_at,
         image: req.body.image},
      function(err,data) {
        if (err) {
          res.send(err);
        }
        else{
          res.send(data);
        }
      });
  if(req.body.file !== null) {
    const oldPath = req.body.imagePath;
    fs.stat(oldPath, function (err, stats) {
      // console.log(stats);//here we got all information of file in stats variable
      if (err) {
        return console.error(err);
      }
      fs.unlink(oldPath, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
      });
    });
  }
})

// delete employee
app.post("/Api/UserAPI/deleteEmployee/:id",function(req,res){
  model.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    const oldPath = post.image;
    fs.stat(oldPath, function (err, stats) {
      // console.log(stats);//here we got all information of file in stats variable
      if (err) {
        return console.error(err);
      }
      fs.unlink(oldPath, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
      });
    });
    model.remove({ _id: req.params.id }, function(err) {
      if(err){
        res.send(err);
      }
      else{
        res.send({data:"Record has been Deleted..!!"});
      }
    });
  });

})

// get all employees
app.get("/Api/UserAPI/AllEmployee",function(req,res){
  model.find({},function(err,data){
    if(err){
      res.send(err);
    }
    else{
      res.send(data);
    }
  });
})

/* GET EMPLOYEE BY ID */
app.get('/Api/UserAPI/getEmployee/:id', function(req, res) {
  model.findById(req.params.id, function (err, post) {
      if (err) return next(err);
      console.log(post.image);
      res.json(post);
    });
});

app.listen(50468, function () {

  console.log('Example app listening on port 50468!')
})
