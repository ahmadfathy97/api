const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
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

// node mailer
function sendEmail(email, randNum){
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false, // false if http true if https i think :)
      logger: true,
      auth: {
        user: '',//put your email here
        pass: ''//put your password here
      }
    });
  const mailOptions = {
    from: 'ahmad\'s blog', // sender address
    to: email, // list of receivers
    subject: 'verification', // Subject line
    html: `<p>your verification number is <code style="font-style: italic"> ${randNum} </code> </p>`// plain text body
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log('err:' + err)
    else
      console.log(info);
  });
}



// sign up
router.post('/signup', uploadImage,(req, res)=>{
  if(!req.user){
    let errors = [];
    let pic;
    if(req.file) pic = req.file.path.replace('public', '');
    let {username, email, password, info, dayOfBirth} = req.body;

    if(!username || !email || !password || !info || !dayOfBirth || !req.file){
      errors.push({msg: "all fields are required"});
    } else if(!email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)){
      errors.push({msg: "this is not an email"});
    }
    if(!errors.length){
      console.log(req.body,req.file);
      Users.findOne({ email: email }, (err, data) => {
          if (err) console.log(err);
          if (data) {
              errors.push({msg: 'this email already exists'});
          } else {
            let randNum = parseInt(Math.random().toString().slice(2,10));
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) res.json({error: err});
                password = hash;
                Users({
                    username, email, password, pic, info, dayOfBirth,
                    followers: [],
                    following: [],
                    verificationNum: randNum
                }).save((err, user) => {
                    if (err) res.json({error: err});
                    console.log(user);
                    sendEmail(email, randNum)
                    res.json({msg: `check ${email} to verify your account`, success: true});
                });
              });
            });
          }
      });
    } else{
      res.json({success: false, errors})
    }
  } else{
    res.json({msg: 'you are already logged in log out to sign up'})
  }
});

// log in
router.post('/login', (req, res)=>{
  if(!req.user){
    let query = { email: req.body.email };
    Users.findOne(query, (err, user) => {
        if (err) res.json({success: false, msg:'something went wrong'});
        if (user) {
          bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
              if (err) res.json({success: false, msg:'something went wrong'});
              if (isMatch && user.verified) {
                  const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN);
                  res.json({success: true, auth_token: token, id: user._id});
                  //res.header('auth_token', token).send(token);
              } else if(isMatch && !user.verified) {
                  res.json({success: false, notVerified: true,msg: `you have to verify you email check ${user.email}` });
              } else {
                  res.json({success: false, msg: 'wrong password'});
              }
          });
        } else {
            res.json({success: false, msg: 'wrong email'});
        }
    });
  }
});

// log out
router.post('/logout', verify, (req, res)=>{
  res.json({msg: 'you logged out'});
});
module.exports = router;
