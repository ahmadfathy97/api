const express = require('express');
const router = express.Router();
//models
let Users = require('../models/users');

const bcrypt = require('bcryptjs');

const verify = require('../verifyToken');
//search for any user matches the query
router.get('/', verify, (req, res) => {
  Users.find({username: {$regex : '.*' + req.query.username + '.*', $options: 'i'}})
  .select({username: 1, _id: 1, pic: 1})
  .exec((err, users) => {
    if(err) res.json({msg: err});
    if(users.length){
      let newUsers = [];
      users.forEach((user)=>{
        let newUser = user.toJSON();
        if(newUser.password) delete user.password;
        if(newUser.pic) newUser.pic = `http://${req.hostname}/${newUser.pic}`;
        newUsers.push(newUser);
      });
      res.json({searchResult: newUsers});
    } else {
      res.json({noResults: 'no users matches'});
    }
  });
});


module.exports = router;
