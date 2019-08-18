const express = require('express');
const router = express.Router();
//models
let Posts = require('../models/posts');
let Comments = require('../models/comments');

// delete specific comment
router.delete('/:comment_id', (req, res)=>{
  Comments.findById(req.params.comment_id, (err, comment)=>{
    if(err) res.json({msg: err});
    if(comment.user_id == req.session.user._id){
      Comments.remove({_id: req.params.comment_id}, (err)=>{
        if (err) res.json({msg: err});
        res.json({msg: 'comment deleted'});
      });
    } else{
      res.json({msg: 'so cute ☺'});
    }
  });
});

module.exports = router;
