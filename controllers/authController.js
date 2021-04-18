const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotEnv = require('dotenv');
const fs = require('fs');
dotEnv.config();

const crypto = require('crypto');

const mailHelper = require('../helpers/mailHelper');
//models
let Users = require('../models/users');

const bcrypt = require('bcryptjs');

let controller = {};

controller.SignUp = (req, res)=>{
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
      Users.findOne({ email: email }, (err, data) => {
          if (err) res.json({success: false, msg: 'something went wrong'})
          else if (data) {
            fs.unlink(req.file.path, err=>{
              if (err) console.log(err);
            })
            errors.push({msg: 'this email already exists'});
            res.json({success: false, errors})
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
                    mailHelper.sendEmail(email, html, 'verification')
                    res.json({msg: `check ${email} to verify your account`, success: true});
                });
              });
            });
          }
      });
    } else{
      fs.unlink(req.file.path, err=>{
        if (err) console.log(err);
      })
      res.json({success: false, errors})
    }
  } else{
    res.json({msg: 'you are already logged in log out to sign up'})
  }
}

controller.LogIn = (req, res)=>{
  if(!req.user){
    let query = { email: req.body.email };
    Users.findOne(query, (err, user) => {
        if (err) res.json({success: false, msg:'something went wrong'});
        else if (user) {
          bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
              if (err) res.json({success: false, msg:'something went wrong'});
              else if (isMatch && user.verified) {
                  const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN);
                  res.json({success: true, auth_token: token, id: user._id});
                  //res.header('auth_token', token).send(token);
              } else if(isMatch && !user.verified) {
                  res.json({success: false, notVerified: true,msg: `you have to verify you email check ${user.email}` });
              } else {
                  res.json({success: false, msg: 'wrong email or password'});
              }
          });
        } else {
            res.json({success: false, msg: 'wrong email or password'});
        }
    });
  }
}


controller.ForgetPassword = (req, res)=>{
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
          else {
            let html = `<p>got to this link to reset your password <a href="${redirectLink}?resetpassword=reset&hash=${buffer.toString('hex')}" >rest your password</a></p>`
            mailHelper.sendEmail(email, html, 'reset your password')
            res.json({success: true, msg: 'check your email'});
          }
        })
      })
    } else {
      res.json({success: false, msg: 'this email does not exist'});
    }
  })
};

controller.ResetPassword = (req, res)=>{
  const {password, confirmPassword} = req.body;
  let error = '';
  if(!password.length || !confirmPassword.length){
    error = 'all fields are required'
  } else if(password !== confirmPassword){
    error = 'passwords don\'t match'
  }

  if(!error.length){
    Users.findOne({resetPassHash: req.params.hash, resetPassExp: {$gt: Date.now()}}, (err, user)=>{
      if(err) res.json({success: false, msg: 'something went wrong'});
      else if (user){
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            Users.update({_id:user._id}, {
              $set: {password: hash, resetPassExp: Date.now(), verified: true}
            },
            err =>{
              if(err) res.json({success: false, msg: 'something went wrong'});
              else res.json({success: true, msg: 'you can login with the new password'});
            })
          })
        })
      }
      else res.json({success: false, msg: 'this link expired'});
    })
  } else{
    res.json({success: false, msg: error});
  }
};

controller.LogOut = (req, res)=>{
  // maybe I should add something like a black list for tokens that logged out
  res.json({msg: 'you logged out'});
}
module.exports = controller;
