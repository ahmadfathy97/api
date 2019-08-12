const express = require('express');
const router = express.Router();
//models
let Users = require('../models/users');

const bcrypt = require('bcryptjs');

// sign up
router.post('/signup', (req, res)=>{
  if(!req.session.user){
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let pic = req.body.pic;
    let info = req.body.info;
    let dayOfBirth = req.body.dayOfBirth;
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
                  username: username,
                  email: email,
                  password: password,
                  pic: pic,
                  info: info,
                  dayOfBirth: dayOfBirth,
                  followers: [],
                  following: []
              }).save((err, user) => {
                  if (err) res.json({error: err});
                  console.log(user);
                  res.json({msg: 'registered'});
                  return true;
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
  if(req.session.user){
    res.redirect('/api/posts');
  } else {
    let query = { email: req.body.email };
    Users.findOne(query, (err, data) => {
        if (err) res.json({error:err});
        if (data) {
          bcrypt.compare(req.body.password, data.password, (err, isMatch) => {
              if (err) res.json({error:err});
              if (isMatch) {
                  req.session.user = data;
                  req.session.user.followers = data.followers;
                  req.session.user.following = data.following;
                  res.json({msg: 'welcome'});
                  return true;
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
router.post('/logout', (req, res)=>{
  req.session = null;
  res.json({msg: 'you logged out'});
});
module.exports = router;
