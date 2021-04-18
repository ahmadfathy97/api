//models
let Users = require('../models/users');
let Notifications = require('../models/notifications');

const bcrypt = require('bcryptjs');

let controller = {};

controller.FetchAllNotifications = (req, res)=>{
  Notifications.find({owner: req.user._id})
  .sort({noti_time: -1})
  .populate({
    path: 'user_id',
    select: ['username', '_id', 'pic']
  })
  .exec((err, notis)=>{
    res.json({notis: notis})
  });
};

controller.MakeNotificationsReaded = (req, res)=>{
  Notifications.updateMany(
    {owner: req.user._id, readed: false},
    {$set:
      {readed: true}
    },
    err => {
      if (err) console.log(err);
    }
  )
}


controller.SpecificUser = (req, res)=>{
  Users.findById(req.params.id)
  .select('-password -notifications -resetPassHash -resetPassExp -verificationNum -verified')
  .exec((err, user)=>{
    if (err) res.json({success: false, msg : 'something went wrong'});
    if(user){
      if(user.archive) {
        res.json({success: false, msg: 'sorry this account deleted'});
      }
      else {
        let customUser = user.toJSON();
        if(customUser.pic) customUser.pic = `http://${req.hostname}/${customUser.pic}`;
        res.json({success: true, user: customUser});
      }
    }
  });
};


controller.VerifyEmail = (req, res)=>{
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
};


controller.UpdateUser = (req, res)=>{
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
      res.json({success: false, msg: 'so cute ☺'});
    }
  });
};


controller.ChangePassword = (req, res)=>{
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
      res.json({success: false, msg: 'so cute ☺'});
    }
  });
};

controller.DeleteUser = (req, res)=>{
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
      res.json({success: false, msg: 'so cute ☺'});
    }
  });
};


controller.FollowOrUnfollow = (req, res)=>{
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
};

module.exports = controller;
