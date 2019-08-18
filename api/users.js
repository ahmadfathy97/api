const express = require('express');
const router = express.Router();
//models
let Users = require('../models/users');
let Notifications = require('../models/notifications');


const bcrypt = require('bcryptjs');

router.get('/:id', (req, res)=>{
  if(req.session.user){
    if(req.session.user._id === req.params.id){
      Users.findById(req.params.id)
      .populate('notifications')
      .exec((err, user)=>{
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
          let customUser = user.toJSON();
          if(customUser.password) delete customUser.password;
          if(customUser.notifications) delete customUser.notifications;
          res.json(customUser);
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
        Users.findOneAndUpdate(
          {_id: req.params.id},
          {
            $set: {
              username: req.body.username || user.username,
              email: req.body.email || user.email,
              pic: req.body.pic || user.pic,
              info: req.body.info || user.info,
              dayOfBirth: req.body.dayOfBirth || user.dayOfBirth,
              gender: req.body.gender || user.gender
            }
          }, (err)=>{
          if(err) res.json({error12: err});
          res.json({msg: 'user Updated'});
        });
      } else {
        res.json({msg: 'are you crazy?‼ ... it is not your account and you wanna edit it... fuck you nigga'});
      }
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});


// change password
router.put('/:id/password', (req, res)=>{
  if(req.session.user){
    Users.findById(req.params.id, (err, user)=> {
      if(err) res.json({msg: err});
      if(user._id == req.session.user._id){
        let password = req.body.password;
        let oldPassword = req.body.oldPassword;
        if(password && oldPassword){
          bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
              if (err) res.json({error:err});
              if (isMatch) {
                bcrypt.genSalt(10, (err, salt)=>{
                  if (err) res.json({msg: err})
                  bcrypt.hash(password, salt, (err, hash)=>{
                    if (err) res.json({msg: err})
                    password = hash;
                    Users.findOneAndUpdate(
                      {_id: req.params.id},
                      {
                        $set: {
                          password: password
                        }
                      }, (err)=>{
                      if(err) res.json({error12: err});
                      res.json({msg: 'password Updated'});
                    });
                  });
                });
              } else {
                  res.json({msg: 'old password field does not match the old password'});
              }
          });
        } else {
          res.json({msg: 'all fields required'});
        }
      } else {
        res.json({msg: 'are you crazy?‼ ... it is not your account and you wanna edit it... fuck you nigga'});
      }
    });
  } else {
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
            Notifications(
              {
                noti_type: 'follow',
                user_id: req.session.user._id,
                item_id: req.params.id,
                noti_text: 'is following your',
                noti_time: '20-02-2019'
              }
            )
            .save((err, noti) => {
                if (err) console.log(err);
                Users.findOneAndUpdate(
                  {_id: req.params.id},
                  {$push:{
                    notifications: noti._id
                  }},
                  err => {
                    if(err) console.log(err);
                    Users.findById(req.params.id, (err, User)=>{
                      res.json({followersNum: User.followers.length});
                    });
                  });
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
