const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const router = express.Router();
const dotEnv = require('dotenv');
dotEnv.config();

const crypto = require('crypto');

//models
let Users = require('../models/users');

const bcrypt = require('bcryptjs');


// node mailer
function sendEmail(email, html, subject){
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false, // false if http true if https i think :)
      logger: true,
      auth: {
        user: process.env.EMAIL,//put your email here
        pass: process.env.PASSWORD//put your password here
      }
    });
  const mailOptions = {
    from: 'ahmad\'s blog', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    html:html // plain text body
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log('err:' + err)
    else
      console.log(info);
  });
}

let AuthController = {};

AuthController.SignUp = (req, res)=>{
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
                    let html =`<p>your verification number is <code style="font-style: italic"> ${randNum} </code> </p>`
                    sendEmail(email, html, 'verification')
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
}

AuthController.LogIn = (req, res)=>{
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
}


AuthController.ForgetPassword = (req, res)=>{
  const {email, redirectLink} = req.body;
  let hash = crypto.createHash('sha256');
  Users.findOne({email: email}, (err, user)=>{
    if(err) res.json({success: flase, msg: 'something went wrong'});
    if(user) {
      crypto.randomBytes(32, function(err, buffer){
        if(err) res.json({success: flase, msg: 'something went wrong'});
        Users.update({email: email}, {
          $set: {
            resetPassHash : buffer.toString('hex'),
            resetPassExp: Date.now() + 1000 * 60 * 60 * 2
          }
        },
        err =>{
          if(err) res.json({success: flase, msg: 'something went wrong'});
          let html = `<p>got to this link to reset your password <a href="${redirectLink}?resetpassword=reset&hash=${buffer.toString('hex')}" >rest your password</a></p>`
          sendEmail(email, html, 'reset your password')
          res.json({success: true, msg: 'check your email'});
        })
      })
    } else {
      res.json({success: false, msg: 'the email does not exist'});
    }
  })
};

AuthController.ResetPassword = (req, res)=>{
  const {password, confirmPassword} = req.body;
  let error = '';
  if(!password.length || !confirmPassword.length){
    error = 'all fields are required'
  } else if(password !== confirmPassword){
    error = 'password does not match'
  }

  if(!error.length){
    Users.findOne({resetPassHash: req.params.hash}, (err, user)=>{
      console.log(user.resetPassExp, Date.now())
      if(err) res.json({success: false, msg: 'something went wrong'});
      if(user && user.resetPassExp > Date.now() ){
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            Users.update({_id:user._id}, {
              $set: {password: hash, resetPassExp: Date.now(), verified: true}
            },
            err =>{
              if(err) res.json({success: false, msg: 'something went wrong'});
              res.json({success: true, msg: 'you can login with the new password'});
            })
          })
        })
      } else if(user && user.resetPassExp <= Date.now() ){
        res.json({success: false, msg: 'this link expired'});
      } else{
        res.json({success: false, msg: 'something went wrong'});
      }
    })
  } else{
    res.json({success: false, msg: error});
  }
};

AuthController.LogOut = (req, res)=>{
  res.json({msg: 'you logged out'});
}
module.exports = AuthController;
