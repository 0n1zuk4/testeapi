require('dotenv').config();
var jwt = require('jsonwebtoken');

var express = require('express');
var router = express.Router();

function verifyJWT(req, res, next){
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}

/* GET home page. */
router.get('/', verifyJWT,function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Userlist page. */
router.get('/userlist',verifyJWT, function(req, res) {
   var db = require("../db");
   var Users = db.Mongoose.model('usercollection', db.UserSchema, 'usercollection');
   Users.find({}).lean().exec(
      function (e, docs) {
         res.render('userlist', { "userlist": docs });
   });
});

/* GET New User page. */
router.get('/newuser', verifyJWT, function(req, res,next) {
  res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function (req, res) {

    var db = require("../db");
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    var Users = db.Mongoose.model('usercollection', db.UserSchema, 'usercollection');
    var user = new Users({ username: userName, email: userEmail });
    user.save(function (err) {
        if (err) {
            console.log("Error! " + err.message);
            return err;
        }
        else {
            console.log("Post saved");
            res.redirect("userlist");
        }
    });
});

router.get('/login', function(req,res){
  res.render('login');
})

router.post('/login', (req,res,next) =>{
  if(req.body.username === 'onizuka' && req.body.pwd === '123'){
    //auth ok
    const id = 1; // viria do banco
    var token = jwt.sign({id}, process.env.SECRET, {
      expiresIn: 300 // expira em 5 min
    });
    res.status(200).send({auth: true, token: token});
  }
  res.status(500).send('Login invalido');
});

router.get('/logout', function(req,res){
  res.status(200).send({auth: false, token: null});
});

module.exports = router;
