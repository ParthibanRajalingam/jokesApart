const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const bodyParser = require('body-parser')
 
const app = express();
const port = process.env.PORT || 3000;

// Connection URL
const url = 'mongodb://parth:shark13@ds213705.mlab.com:13705/jokes';
 
// Database Name
const dbName = 'jokes';

 // parse application/json
app.use(bodyParser.json());
app.use(function(req,res,next){
      res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

app.get('/joke', (req, res) => {

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("jokes");
  var min =0;


  dbo.collection("sequence").find({}).toArray( function(err, result) {
    if (err) throw err;
    console.log(result[0].jokes);
    var max= result[0].jokes;
    var randomJokeId = Math.floor(Math.random() * max) + min ;

    dbo.collection("joke").find({"id": randomJokeId}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
      res.send(result);
    db.close();
  });
  });


});

 

})


app.post('/joke', (req, res) =>{
console.log(req.body);

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("jokes");
  var myobj = req.body;
  var id,approved;

//Getting id
    dbo.collection("sequence").find({}).toArray( function(err, result) {
    if (err) throw err;
    console.log(result[0].jokes);
    id = result[0].jokes;
    myobj["id"] = id;
    myobj["approved"] ="false";
    myobj["likes"] = 0;
    dbo.collection("joke").insertOne(myobj, function(err, result) {
    if (err) throw err;
    console.log("1 document inserted");


    dbo.collection("sequence").updateOne({"jokes":id}, {$set:{"jokes":++id}}, function(err, result) {
    if (err) throw err;
    console.log("1 document updated");
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
    console.log("1 document updated");
    db.close();
    res.send(result);
  });


});

 

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));