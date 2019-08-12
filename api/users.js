const express = require('express');
const router = express.Router();
//models
let Users = require('../models/users');

router.get('/:id', (req, res)=>{
  if(req.session.user){
    if(req.session.user._id === req.params.id){
      Users.findById(req.params.id, (err, user)=>{
        if (err) res.json({error : err});
        res.json(user);
      });
    } else {
      Users.findById(req.params.id, (err, user)=>{
        if (err) res.json({error : err});
        let custonUser = user.toJSON();
        if(custonUser.password) delete custonUser.password;
        res.json(custonUser);
      });
    }
  } else {
    res.json({msg : 'you must log in first'});
  }
});
/*
  git Users
  delete Users
  edit Users
*/
module.exports = router;
