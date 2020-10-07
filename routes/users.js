const express = require('express');
const router = express.Router();
//models
let Users = require('../models/users');
let Notifications = require('../models/notifications');


const bcrypt = require('bcryptjs');

const verify = require('../middlewares/verifyToken');


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


router.get('/notifications', verify,(req, res)=>{
  Notifications.find({owner: req.user._id})
  .sort({noti_time: -1})
  .populate({
    path: 'user_id',
    select: ['username', '_id', 'pic']
  })
  .exec((err, notis)=>{
    res.json({notis: notis})
  });
});
router.post('/notifications', verify, (req, res)=>{
  Notifications.updateMany(
    {owner: req.user._id, readed: false},
    {$set:
      {readed: true}
    },
    err => {
      if (err) console.log(err);
    }
  )
})
router.get('/:id', verify, (req, res)=>{
  if(req.user){
    Users.findById(req.params.id, (err, user)=>{
      if (err) res.json({error : err});
      if(user.archive) {
        res.json({msg: 'sorry this account deleted'});
      }
      else {
        let customUser = user.toJSON();
        if(customUser.password) delete customUser.password;
        if(customUser.notifications) delete customUser.notifications;
        if(customUser.pic) customUser.pic = `http://${req.hostname}/${customUser.pic}`;
        res.json(customUser);
      }
    });
  } else {
    res.json({msg : 'you must log in first'});
  }
});

// verification

router.post('/verify/', (req, res)=>{
  if(!req.user){
    Users.findOne({email: req.query.email}, (err, user)=>{
      if(!user.verified){
        if(parseInt(req.body.verificationNum) === user.verificationNum){
          Users.update(
            {email : req.query.email},
            {$set: {verified: true } },
            err =>{
              console.log(err);
              res.json({success: true, msg: 'emaile verified, You can login now'})
            })
        } else{
          res.json({success: false, msg: 'the code is not correct'})
        }
      } else{
          res.json({success: false, msg: 'this email already verfied '})
      }
    })
  }
});
// update specific user
router.put('/:id', verify, uploadImage,(req, res)=>{
  if(req.user){
    let pic;
    Users.findById(req.params.id, (err, user)=> {
      if(req.file) {
        pic = req.file.path.replace('public', '');
        fs.unlink('public/' +user.pic, (err)=>{
          if(err) console.log(err);
        })
      }
      if(err) res.json({msg: err});
      if(user._id == req.user._id){
        Users.findOneAndUpdate(
          {_id: req.params.id},
          {
            $set: {
              username: req.body.username || user.username,
              email: req.body.email || user.email,
              pic: pic || user.pic,
              info: req.body.info || user.info,
              dayOfBirth: req.body.dayOfBirth || user.dayOfBirth,
              gender: req.body.gender || user.gender,
              // admin: req.body.admin || false
            }
          }, (err)=>{
          if(err) res.json({error: err});
          Users.findById(req.params.id, (err, newUser)=>{
            if (err) res.json({error : err});
            if(user.archive) {
              res.json({msg: 'sorry this account deleted'});
            } else{
            let customUser = newUser.toJSON();
            if(customUser.password) delete customUser.password;
            if(customUser.notifications) delete customUser.notifications;
            if(customUser.pic) customUser.pic = `http://${req.hostname}/${customUser.pic}`;
            res.json(customUser);
            }
          })
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
router.put('/:id/password', verify, verify, (req, res)=>{
  if(req.user){
    Users.findById(req.params.id, (err, user)=> {
      if(err) res.json({msg: err});
      if(user._id == req.user._id){
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
router.delete('/:id', verify, (req, res)=>{
  if(req.user){
    Users.findById(req.params.id, (err, user)=>{
      if(err) res.json({msg: err});
      if(user._id == req.user._id){
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

router.post('/:id/follow', verify, (req, res)=>{
  Users.findById(req.params.id, (err, User)=>{
    if(err) res.json({msg: err});
    if(User.followers.indexOf(req.user._id) < 0){
      Users.findOneAndUpdate(
        {_id: req.params.id},
        {
          $push:{
            followers: req.user._id
          }
        },
        err => {
          if(err) res.json({msg: err});
          Users.findOneAndUpdate(
            {_id: req.user._id},
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
                owner: req.params.id,
                user_id: req.user._id,
                item_id: req.params.id,
                noti_text: 'is following you',
                noti_time: req.body.time
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
                      res.json({followers: User.followers});
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
            followers: req.user._id
          }
        },
        err => {
          if(err) res.json({msg: err});
          Users.findOneAndUpdate(
            {_id: req.user._id},
            {
              $pull:{
                following: req.params.id
              }
            },
          err => {
            if(err) res.json({msg: err});
            Users.findById(req.params.id, (err, User)=>{
              res.json({followers: User.followers});
            });
          });
        });
      }
  });
});

module.exports = router;
