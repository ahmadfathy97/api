const express = require('express');
const router = express.Router();
//models
let Posts = require('../models/posts');
let Comments = require('../models/comments');

// get all posts
router.get('/', (req, res)=>{
  if(req.session.user){
    Posts.find({})
    .populate('user_id')
    .populate('category_id')
    .populate({
      path: 'comments',
      populate: {
        path: 'user_id',
        select: ['username', '_id', 'pic']
      }
    })
    .exec((err, posts)=>{
      if(err) console.log(err);
      let customPosts = [];
      posts.forEach((post)=>{
        let customPost = post.toJSON();
        if(customPost.user_id.password) delete customPost.user_id.password;
        customPost.comments.forEach((comment)=>{
          if(comment.user_id.password) delete comment.user_id.password;
        });
        if(customPost.user_id._id == req.session.user._id) customPost.owner = true;
        customPosts.push(customPost);
      });
      res.json(customPosts);
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});

// create new post
router.post('/', (req, res)=>{
  if(req.session.user){
    let newPost = {};
    newPost.title = req.body.title;
    newPost.body = req.body.body;
    newPost.created_at = req.body.created_at;
    newPost.user_id = req.session.user._id;
    newPost.category_id = req.body.category_id;
    Posts(newPost).save((err)=>{
      if (err) {
        console.log(err);
        res.json({msg: 'post not created'});
      };
      res.json({msg: 'post created'});
    });
  } else{
    res.json({msg: 'you must login first'});
  }
  //5d509407605a622a18ec3725 category
});

// get specific post
router.get('/:id', (req, res)=>{
  if(req.session.user){
    Posts.findById(req.params.id)
    .populate('user_id')
    .populate('category_id')
    .populate({
      path: 'comments',
      populate: {
        path: 'user_id',
        select: ['username', '_id', 'pic']
      }
    })
    .exec((err, post)=>{
      if(err) console.log(err);
      let customPost = post.toJSON();
      if(customPost.user_id.password) delete customPost.user_id.password;
      customPost.comments.forEach((comment)=>{
        if(comment.user_id.password) delete comment.user_id.password;
      });
      if(customPost.user_id._id == req.session.user._id) customPost.owner = true;
      res.json(customPost);
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});

// delete specific post
router.delete('/:id', (req, res)=>{
  if(req.session.user){
    Posts.findById(req.params.id)
    .populate('user_id')
    .populate('category_id')
    .exec((err, post)=>{
      if(err) console.log(err);
      if(post.user_id._id == req.session.user._id){
        Posts.remove({_id: req.params.id}, (err)=>{
          if(err) res.json(err);
          res.json({msg: 'post Deleted'});
        });
      } else {
        res.json({msg: 'are you crazy?‼ ... it is not your post and you wanna delete it... fuck you nigga'});
      }
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});

// update specific post
router.put('/:id', (req, res)=>{
  if(req.session.user){
    Posts.findById(req.params.id)
    .populate('user_id')
    .populate('category_id')
    .exec((err, post)=>{
      if(err) console.log(err);
      if(post.user_id._id == req.session.user._id){
        Posts.findOneAndUpdate(
          {_id: req.params.id},
          {
            $set: {
              title: req.body.title,
              body: req.body.body,
              category_id: req.body.category_id
            }
          }, (err)=>{
          if(err) res.json({error: err});
          res.json({msg: 'post Updated'});
        });
      } else {
        res.json({msg: 'are you crazy?‼ ... it is not your post and you wanna edit it... fuck you nigga'});
      }
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});

//like and unlike
router.post('/:id/like', (req, res)=>{
  Posts.findById(req.params.id)
  .populate('user_id')
  .exec((err, post)=>{
    if(err) res.json({msg: err});
    if(post.likes.indexOf(req.session.user._id) < 0){
      Posts.findOneAndUpdate(
        {_id: req.params.id},
        {
          $push:{
            likes: req.session.user._id
          }
        },
        (err => {
          if(err) res.json({msg: err});
          Posts.findById(req.params.id, (err, post)=>{
            res.json({likesNum: post.likes.length});
          });
        }
      )
    )
    } else {
      Posts.findOneAndUpdate(
        {_id: req.params.id},
        {
          $pull:{
            likes: req.session.user._id
          }
        },
        (err) => {
          if(err) res.json({msg: err});
          Posts.findById(req.params.id, (err, post)=>{
            res.json({likesNum: post.likes.length});
          });
        }
      )
    }
  })
});

// add comment
router.post('/:id/add-comment', (req, res)=>{
  Comments({
    user_id: req.session.user._id,
    comment_body: req.body.comment_body,
    comment_time: req.body.comment_time
  })
  .save((err, comment)=>{
    if(err) res.json({msg: err});
    Posts.findOneAndUpdate({_id: req.params.id}, {
      $push:{
        comments: comment._id
      }
    },
    err => {
      if(err) res.json({msg: err});
      res.json({msg: 'comment added'});
    });
  });
});
module.exports = router;
