const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const bodyParser = require('body-parser')
 
const app = express();
const port = process.env.PORT || 3000;

// Connection URL
//const url = 'mongodb://parth:shark13@ds213705.mlab.com:13705/jokes';
const url = 'mongodb+srv://parth:shark13@cluster0.x127v.mongodb.net/jokes';
 
// Database Name
const dbName = 'jokes';

//logging
const fs = require('fs');
const util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

 // parse application/json
app.use(bodyParser.json());





app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    //Get user's IP
    try{
    	 const ip = (req.headers['x-forwarded-for'] || '').split(',').pop() || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
         
         //Update visitor count
         updateVisiotorsCount(ip);
    }
    catch(error){
    	console.log('Error '+error);
    }

    next();
});



app.get('/joke', (req, res) => {

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("jokes");
  var min =0;


  dbo.collection("sequence").find({}).toArray( function(err, result) {
    if (err) throw err;
    //console.log(result[0].jokes);
    var max= result[0].jokes;
    var randomJokeId = Math.floor(Math.random() * max) + min ;

    dbo.collection("joke").find({"id": randomJokeId}).toArray(function(err, result) {
    if (err) throw err;
   // console.log(result);
      res.send(result);
    db.close();
  });
  });


});

 

})

app.get('/', (req, res) => {

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("jokes");
  var min =0;


  dbo.collection("sequence").find({}).toArray( function(err, result) {
    if (err) throw err;
   // console.log(result[0].jokes);
    var max= result[0].jokes;
    var randomJokeId = Math.floor(Math.random() * max) + min ;

    dbo.collection("joke").find({"id": randomJokeId}).toArray(function(err, result) {
    if (err) throw err;
    //console.log(result);
      res.send(result);
    db.close();
  });
  });


});

 

})


app.post('/joke', (req, res) =>{
//console.log(req.body);

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("jokes");
  var myobj = req.body;
  var id,approved;

//Getting id
    dbo.collection("sequence").find({}).toArray( function(err, result) {
    if (err) throw err;
   // console.log(result[0].jokes);
    id = result[0].jokes;
    myobj["id"] = id;
    myobj["approved"] ="false";
    myobj["likes"] = 0;
    dbo.collection("joke").insertOne(myobj, function(err, result) {
    if (err) throw err;
   // console.log("1 document inserted");


    dbo.collection("sequence").updateOne({"jokes":id}, {$set:{"jokes":++id}}, function(err, result) {
    if (err) throw err;
  //  console.log("1 document updated");
    db.close();
    res.send(result);
  });
    
  });

  });



});
} )

app.put('/joke', (req, res) => {

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("jokes");

    dbo.collection("joke").updateOne({"id":req.body.id}, {$set:{"likes":req.body.likes}}, function(err, result) {
    if (err) throw err;
   // console.log("1 document updated");
    db.close();
    res.send(result);
  });


});

 

});

function updateVisiotorsCount(ip) {

	MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("jokes");
  var myobj = {'date':getDate(),'visitorCount':1};
  var count;
  console.log('IP'+ip);
//Getting id
    dbo.collection("visitorCount").find({'date':myobj.date}).toArray( function(err, visitorResult) {
    if (err) throw err;
    if(visitorResult.length){

    count = visitorResult[0].visitorCount + 1;
   // console.log('---count---'+count);
    dbo.collection("visitorCount").updateOne({'date':String(myobj.date)}, {$set:{"visitorCount": count}}, function(err, result) {
    if (err) throw err;
    //console.log("1 document updated in visitorCount");
      });

    }else{
    dbo.collection("visitorCount").insertOne(myobj, function(err, result) {
    if (err) throw err;
   // console.log("1 document inserted visitorCount");

    db.close();
    
  });
    }


  });



});
  
}

//ddmmyyyy
function getDate(){

	var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();

if (dd < 10) {
  dd = '0' + dd;
}

if (mm < 10) {
  mm = '0' + mm;
}

today =  dd+  mm + yyyy;
return today;

}

app.listen(port, () => console.log(`App listening on port ${port}!`));
