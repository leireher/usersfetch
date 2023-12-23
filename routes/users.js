var express = require('express');
var router = express.Router();

var mongojs = require('mongojs')
const db = mongojs('mongodb://127.0.0.1:27017/bezeroakdb', ['bezeroak'])

const multer  = require('multer')
const path = require('path');

var fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
    
const upload = multer({ storage: storage,
        limits: {
            fileSize: 2e+6,
        },
        fileFilter: function (req, file, cb) {
            let ext = path.extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg') {
                    req.fileValidationError = "Forbidden extension";
                    return cb(null, false, req.fileValidationError);
            }
            cb(null, true);
        }
        })

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


router.post("/new", upload.single('avatar'), function (req, res, next) {
    
  data = {izena: req.body.izena, abizena: req.body.abizena, email: req.body.email}

  if (!req.file) {
    data['avatar'] = "uploads/no-image.png"
  }
  else
  data['avatar'] = req.file.path

  db.bezeroak.insert(data, function (err, docs) {
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

router.put("/update/:id", upload.single('avatar'), (req, res) => {
  
  let user = users.find(user => user._id == req.params.id);

  user['izena'] = req.body.izena
  user['abizena'] = req.body.abizena
  user['email'] = req.body.email
  
  if (req.file) {
    user['avatar'] = req.file.path
  }

  db.bezeroak.update({_id: mongojs.ObjectId(req.params.id)}, {$set: {izena: req.body.izena, abizena: req.body.abizena, email: req.body.email, avatar: user.avatar}}, function (err, docs) {
    if(err){
      console.log(err)
    }
    else {
      console.log(docs)
    }
  }) 

  res.json(user);
  
})

module.exports = router;
