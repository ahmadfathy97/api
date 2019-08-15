const express = require('express');
const router = express.Router();
//models
let Users = require('../models/users');

const bcrypt = require('bcryptjs');

router.get('/:id', (req, res)=>{
  if(req.session.user){
    if(req.session.user._id === req.params.id){
      Users.findById(req.params.id, (err, user)=>{
        if (err) res.json({error : err});
        if(user.archive) res.json({msg: 'sorry this account deleted'});
        else res.json(user);
      });
    } else {
      Users.findById(req.params.id, (err, user)=>{
        if (err) res.json({error : err});
        if(user.archive) {
          res.json({msg: 'sorry this account deleted'});
        }
        else {
          let custonUser = user.toJSON();
          if(custonUser.password) delete custonUser.password;
          res.json(custonUser);
        }
      });
    }
  } else {
    res.json({msg : 'you must log in first'});
  }
});

// update specific user
router.put('/:id', (req, res)=>{
  if(req.session.user){
    Users.findById(req.params.id, (err, user)=> {
      if(err) res.json({msg: err});
      if(user._id == req.session.user._id){
        let password = req.body.password;
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) res.json({error: err});
            password = hash;
            Users.findOneAndUpdate(
              {_id: req.params.id},
              {
                $set: {
                  username: req.body.username,
                  email: req.body.email,
                  password: password,
                  pic: req.body.pic,
                  info: req.body.info,
                  dayOfBirth: req.body.dayOfBirth,
                  gender: req.body.gender
                }
              }, (err)=>{
              if(err) res.json({error: err});
              res.json({msg: 'user Updated'});
            });
        });
      });
    } else {
      res.json({msg: 'are you crazy?‼ ... it is not your account and you wanna edit it... fuck you nigga'});
    }
  });
  }else {
    res.json({msg: 'you must login first'});
  }
});

// delete specific user
router.delete('/:id', (req, res)=>{
  if(req.session.user){
    Users.findById(req.params.id, (err, user)=>{
      if(err) res.json({msg: err});
      if(user._id == req.session.user._id){
        Users.findOneAndUpdate(
          {_id: req.params.id},
          {$set: {
              archive: true
            }
          },
          (err)=>{
            if(err) res.json({msg: err});
            res.json({msg: 'user Deleted'});
          }
        )
      } else {
        res.json({msg: 'are you crazy?‼ ... it is not your account and you wanna delete it... fuck you nigga'});
      }
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});


//follow and unfollow

router.post('/:id/follow', (req, res)=>{
  Users.findById(req.params.id, (err, User)=>{
    if(err) res.json({msg: err});
    if(User.followers.indexOf(req.session.user._id) < 0){
      Users.findOneAndUpdate(
        {_id: req.params.id},
        {
          $push:{
            followers: req.session.user._id
          }
        },
        err => {
          if(err) res.json({msg: err});
          Users.findOneAndUpdate(
            {_id: req.session.user._id},
            {
              $push:{
                following: req.params.id
              }
            },
          err => {
            if(err) res.json({msg: err});
            Users.findById(req.params.id, (err, User)=>{
              res.json({followersNum: User.followers.length});
            });
          });
        });
    } else {
      Users.findOneAndUpdate(
        {_id: req.params.id},
        {
          $pull:{
            followers: req.session.user._id
          }
        },
        err => {
          if(err) res.json({msg: err});
          Users.findOneAndUpdate(
            {_id: req.session.user._id},
            {
              $pull:{
                following: req.params.id
              }
            },
          err => {
            if(err) res.json({msg: err});
            Users.findById(req.params.id, (err, User)=>{
              res.json({followersNum: User.followers.length});
            });
          });
        });
      }
  });
});


module.exports = router;
