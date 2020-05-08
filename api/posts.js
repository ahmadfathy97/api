const express = require('express');
const router = express.Router();
//models
let Posts = require('../models/posts');
let Comments = require('../models/comments');
let Users = require('../models/users');
let Notifications = require('../models/notifications');

const verify = require('../verifyToken');
// get all posts
router.get('/', verify, (req, res)=>{
  console.log(req.user);
  if(req.user){
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
        if(customPost.user_id.notifications) delete customPost.user_id.notifications;
        customPost.comments.forEach((comment)=>{
          if(comment.user_id._id == req.user._id) comment.owner = true;
          if(comment.user_id.password) delete comment.user_id.password;
        });
        if(customPost.user_id._id == req.user._id) customPost.owner = true;
        customPosts.push(customPost);
      });
      res.json(customPosts);
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});

// create new post
router.post('/', verify, (req, res)=>{
  if(req.user){
    let newPost = {};
    newPost.title = req.body.title;
    newPost.body = req.body.body;
    newPost.created_at = req.body.created_at;
    newPost.user_id = req.user._id;
    newPost.category_id = req.body.category_id;
    Posts(newPost).save((err, post)=>{
      if (err) {
        console.log(err);
        res.json({msg: 'post not created'});
      };
      Notifications({
        noti_type: 'new post',
        owner: req.user._id,
        user_id: req.user._id,
        item_id: post._id,
        noti_text: 'created new post',
        noti_time: post.created_at
        })
        .save((err, noti)=>{
          if(err) console.log(err);
          Users.updateMany(
            {following: req.user._id },
            {$push:
              {notifications: noti._id}
            },
          err => {
            if(err) console.log(err)
          })
        })
      res.json({msg: 'post created', post_id: post._id});
    });
  } else{
    res.json({msg: 'you must login first'});
  }
});

router.get('/latest/', verify,(req, res)=>{
  if(req.user){
    Posts.find({})
    .limit(5)
    .sort({'created_at': -1})
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
        if(customPost.user_id.notifications) delete customPost.user_id.notifications;
        customPost.comments.forEach((comment)=>{
          if(comment.user_id._id == req.user._id) comment.owner = true;
          if(comment.user_id.password) delete comment.user_id.password;
        });
        if(customPost.user_id._id == req.user._id) customPost.owner = true;
        customPosts.push(customPost);
      });
      res.json(customPosts);
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});
// get specific post
router.get('/:id', verify, (req, res)=>{
  if(req.user){
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
      if(customPost.user_id.notifications) delete customPost.user_id.notifications;

      customPost.comments.forEach((comment)=>{
        if(comment.user_id.password) delete comment.user_id.password;
        if(comment.user_id._id == req.user._id) comment.owner = true;
      });
      if(customPost.user_id._id == req.user._id) customPost.owner = true;
      res.json(customPost);
    });
  } else {
    res.json({msg: 'you must login first'});
  }
});

// get all posts that belong to one user
router.get('/user/:id', verify,(req, res)=>{
  Posts.find({user_id : req.params.id}, (err, posts)=>{
    if (err) console.log(err);
    res.json(posts);
  });
});

// delete specific post
router.delete('/:id', verify, (req, res)=>{
  if(req.user){
    Posts.findById(req.params.id, (err, post)=>{
      if(err) console.log(err);
      if(post.user_id._id == req.user._id){
        Posts.remove({_id: req.params.id}, (err)=>{
          if(err) res.json(err);
          res.json({msg: 'post Deleted', post_id: req.params.id});
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
router.put('/:id', verify, (req, res)=>{
  if(req.user){
    Posts.findById(req.params.id, (err, post)=>{
      if(err) console.log(err);
      if(post.user_id._id == req.user._id){
        Posts.findOneAndUpdate(
          {_id: req.params.id},
          {
            $set: {
              title: req.body.title || post.title,
              body: req.body.body || post.body,
              category_id: req.body.category_id || post.category_id
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
router.post('/:id/like', verify, (req, res)=>{
  Posts.findById(req.params.id, (err, post)=>{
    if(err) res.json({msg: err});
    if(post.likes.indexOf(req.user._id) < 0){
      Posts.findOneAndUpdate(
        {_id: req.params.id},
        {
          $push:{
            likes: req.user._id
          }
        },
        (err, post) => {
          if(err) res.json({msg: err});
          Notifications(
            {
              noti_type: 'like',
              owner: post.user_id,
              user_id: req.user._id,
              item_id: req.params.id,
              noti_text: 'liked your post',
              noti_time: req.body.time
            }).save((err, noti)=>{
              if (err) console.log(err);
              Users.findOneAndUpdate(
                {_id: post.user_id},
                {$push:{
                  notifications: noti._id
                }},
                err=>{
                if (err) console.log(err);
                Posts.findById(req.params.id, (err, post)=>{
                  if(err) console.log(err);
                  res.json({likes: post.likes, post_id: req.params.id});
                });
              });
            });
        });
    } else {
      Posts.findOneAndUpdate(
        {_id: req.params.id},
        {
          $pull:{
            likes: req.user._id
          }
        },
        (err) => {
          if(err) res.json({msg: err});
          Posts.findById(req.params.id, (err, post)=>{
            res.json({likes: post.likes, post_id: req.params.id});
          });
        }
      )
    }
  });
});

// add comment
router.post('/:id/add-comment', verify, (req, res)=>{
  console.log(req.body, req.params.id);
  Comments({
    user_id: req.user._id,
    comment_body: req.body.comment_body,
    comment_time: req.body.comment_time
  })
  .save((err, comment)=>{
    if(err) res.json({msg: err})
    Posts.findOneAndUpdate({_id: req.params.id}, {
      $push:{
        comments: comment._id
      }
    },
    err => {
      if(err) console.log(err);
      Comments.findById(comment._id)
      .populate('user_id')
      .exec((err, comment)=>{
        if (err) console.log(err);
        res.json({comment: comment, post_id: req.params.id})
        Posts.findById(req.params.id, (err, post)=>{
          if (err) console.log(err);
          Notifications({
            noti_type: 'comment',
            owner: post.user_id,
            user_id: req.user._id,
            item_id: req.params.id,
            noti_text: 'commented on your post',
            noti_time: req.body.comment_time
          })
          .save((err, noti)=>{
            if(err) console.log(err);
            Users.findOneAndUpdate(
            {_id: post.user_id},
            {$push: {
              notifications: noti._id
            }},
            err =>{
              if (err) console.log(err);
              console.log(noti);
            })
          })
        })
      })
    })
  });
});

module.exports = router;
