var express = require('express');
var router = express.Router();

var mongojs = require('mongojs')
const db = mongojs('mongodb://127.0.0.1:27017/bezeroakdb', ['bezeroak'])

var users=[];

// Get All Bezeroak
db.bezeroak.find(function (err, docs) {
  if(err){
    console.log(err)
  }
  else {
    users = docs
  }
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(users)
  res.render('users', {
    title: "Users",
    users: users
  });  
});

router.get('/list', function(req, res, next) {
  res.json(users)
});


router.post("/new", (req, res) => {

  db.bezeroak.insert(req.body, function (err, docs) {
    if(err){
      console.log(err)
    }
    else {
      console.log(docs)
      users.push(docs);
      res.json(docs);
    }
  })  
  
});

router.delete("/delete/:id", (req, res) => {
  users = users.filter(user => user._id != req.params.id);
  db.bezeroak.remove({_id: mongojs.ObjectId(req.params.id)}, function (err, docs) {
    if(err){
      console.log(err)
    }
    else {
      console.log(docs)
      res.json(users);
    }
  })
});

router.put("/update/:id", (req, res) => {
  let user = users.find(user => user._id == req.params.id);
  user.izena = req.body.izena;
  user.abizena = req.body.abizena;
  user.email = req.body.email;
  db.bezeroak.update({_id: mongojs.ObjectId(req.params.id)}, {$set: {izena: req.body.izena, abizena: req.body.abizena, email: req.body.email}}, function (err, docs) {
    if(err){
      console.log(err)
    }
    else {
      console.log(docs)
      res.json(docs);
    }
  })
  
})

module.exports = router;
