const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
//models
let Users = require('../models/users');

const bcrypt = require('bcryptjs');

const verify = require('../verifyToken');
// sign up
router.post('/signup', (req, res)=>{
  if(!req.user){
    let {username, email, password, pic, info, dayOfBirth} = req.body;
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
                  res.json({auth_token: token});
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
