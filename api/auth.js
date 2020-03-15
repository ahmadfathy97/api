const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
//models
let Users = require('../models/users');

const bcrypt = require('bcryptjs');

const verify = require('../verifyToken');


const multer = require('multer');
const path = require('path');
const fs = require('fs');

//express().use('/public', express.static(path.join(__dirname, 'public')));

function filter(file, cb) {
    let exts = ['png', 'jpg', 'jpeg', 'gif'];
    let containeExts = exts.includes(file.mimetype.split('/')[1].toLowerCase()); //return true or false
    let allowdMimeType = file.mimetype.startsWith("image/"); //return true or false
    if(containeExts && allowdMimeType){
        return cb(null ,true)
    }
    else{
        cb('Error: File type not allowed!', false)
    }
}
let storage = multer.diskStorage({
  destination : (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
let upload = multer({
  storage: storage,
  limits: {fileSize: 1024 * 1024 * 10},
  fileFilter: function(req, file, cb) {
    filter(file, cb)
  }
});

let uploadImage = upload.single('pic');


// sign up
router.post('/signup', uploadImage,(req, res)=>{
  if(!req.user){
    let pic = req.file.path.replace('public', '');
    let {username, email, password, info, dayOfBirth} = req.body;
    console.log(req.body,req.file);
    Users.findOne({ email: email }, (err, data) => {
        if (err) console.log(err);
        if (data) {
            res.json({msg: 'this email already exists'});
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) res.json({error: err});
              password = hash;
              Users({
                  username,
                  email,
                  password,
                  pic,
                  info,
                  dayOfBirth,
                  followers: [],
                  following: []
              }).save((err, user) => {
                  if (err) res.json({error: err});
                  console.log(user);
                  res.json({msg: `${username} can login now as with this email ${email}`});
              });
            });
          });
        }
    });
  } else{
    res.json({msg: 'you are already logged in log out to sign up'})
  }
});

// log in
router.post('/login', (req, res)=>{
  if(req.user){
    res.redirect('/api/posts');
  } else {
    let query = { email: req.body.email };
    Users.findOne(query, (err, data) => {
        if (err) res.json({error:err});
        if (data) {
          bcrypt.compare(req.body.password, data.password, (err, isMatch) => {
              if (err) res.json({error:err});
              if (isMatch) {
                  const token = jwt.sign({_id: data._id}, process.env.SECRET_TOKEN);
                  res.json({auth_token: token, id: data._id});
                  //res.header('auth_token', token).send(token);
              } else {
                  res.json({msg: 'wrong password'});
              }
          });
        } else {
            res.json({msg: 'wrong email'});
        }
    });
  }
});

// log out
router.post('/logout', verify, (req, res)=>{
  res.json({msg: 'you logged out'});
});
module.exports = router;
