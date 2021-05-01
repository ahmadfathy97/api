/**
I am thinkg about fetching the posts without its comments
and make another endpoint to fetch its comments
**/

//models
let Posts = require('../models/posts');
let Comments = require('../models/comments');
let Users = require('../models/users');
let Notifications = require('../models/notifications');

const marked = require('marked')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

let controller = {};

controller.FetchAll = (req, res)=>{
  Posts.find({})
  .populate({
    path:'user_id',
    select: ['username', 'pic']
  })
  .populate('category_id')
  .populate({
    path: 'comments',
    populate: {
      path: 'user_id',
      select: ['username', 'pic']
    }
  })
  .exec((err, posts)=>{
    if(err) console.log(err);
    let customPosts = [];
    posts.forEach((post)=>{
      let customPost = post.toJSON();
      customPost.comments.forEach((comment)=>{
        if(comment.user_id._id == req.user._id) comment.owner = true;
      });
      if(customPost.user_id._id == req.user._id) customPost.owner = true;
      customPosts.push(customPost);
    });
    res.json(customPosts);
  });
}


controller.AddPost = (req, res)=>{
  let newPost = {};
  newPost.title = req.body.title;
  newPost.body = req.body.body;
  newPost.dir = req.body.dir;
  newPost.created_at = req.body.created_at;
  newPost.user_id = req.user._id;
  newPost.category_id = req.body.category_id;
  newPost.sanitizedHtml = dompurify.sanitize(marked(req.body.body))
  if(!newPost.title || !newPost.body || !newPost.dir || !newPost.created_at || !newPost.category_id){
    res.json({success: false, 'msg': 'all fields are required'})
  } else{
    Posts(newPost).save((err, post)=>{
      if (err) {
        res.json({success: false, msg: 'post not created'});
      };
      Users.findById(req.user._id)
      .select('followers')
      .exec((err, user)=>{
        if (err) console.log(err);
        Notifications({
          noti_type: 'new post',
          owner: user.followers,
          user_id: req.user._id,
          item_id: post._id,
          noti_text: 'created new post',
          noti_time: post.created_at
          })
          .save((err, noti)=>{
            if(err) console.log(err);
            Users.updateMany(
              {_id: {$in: user.followers} },
              {$push:
                {notifications: noti._id}
              },
            (err, data) => {
              if(err) console.log(err);
              console.log(data);
            })
          })
      });
      res.json({success: true, msg: 'post created', post_id: post._id});
    });
  }
}

controller.Latest = (req, res)=>{
  Posts.find({})
  .limit(5)
  .sort({'createdAt': -1})
  .populate({
    path:'user_id',
    select: ['username', 'pic']
  })
  .populate('category_id')
  .populate({
    path: 'comments',
    populate: {
      path: 'user_id',
      select: ['username', 'pic']
    }
  })
  .exec((err, posts)=>{
    if(err) console.log(err);
    let customPosts = [];
    posts.forEach((post)=>{
      if(post){
        let customPost = post.toJSON();
        customPost.comments.forEach((comment)=>{
          comment.user_id.pic = `http://${req.hostname}/${comment.user_id.pic}`;
          if(comment.user_id._id == req.user._id) comment.owner = true;
        });
        if(customPost.user_id._id == req.user._id) customPost.owner = true;
        customPosts.push(customPost);
      }
    });
    res.json(customPosts);
  });
};

controller.SpecificPost = (req, res)=>{
  Posts.findById(req.params.id)
  .populate({
    path:'user_id',
    select: ['username', 'pic']
  })
  .populate('category_id')
  .populate({
    path: 'comments',
    populate: {
      path: 'user_id',
      select: ['username', 'pic']
    }
  })
  .exec((err, post)=>{
    if(err) res.json({success: false, msg: 'something went wring'});
    else if(post){
      let customPost = post.toJSON();

      customPost.comments.forEach((comment)=>{
        comment.user_id.pic = `http://${req.hostname}/${comment.user_id.pic}`;
        if(comment.user_id._id == req.user._id) comment.owner = true;
      });
      if(customPost.user_id._id == req.user._id) customPost.owner = true;
      res.json(customPost);
    }
  });
}


controller.SpecificUserPosts = (req, res)=>{
  Posts.find({user_id : req.params.id})
  .sort({'createdAt': -1})
  .select('createdAt created_at title')
  .exec((err, posts)=>{
    if (err) res.json({success: false, msg: 'something went wrong'});
    else if(posts){
      res.json({success: true, posts});
    } else {
      res.json({success: false, msg: 'something went wrong'});
    }
  });
};

controller.DeletePost = (req, res)=>{
  Posts.findById(req.params.id)
  .select('comments user_id')
  .exec((err, post)=>{
    if(err) console.log(err);
    if(post && post.user_id == req.user._id){
      Posts.deleteOne({_id: req.params.id}, (err)=>{
        if(err) res.json({success: false, msg: 'something went wrong'});
        Comments.deleteMany({_id: { $in: post.comments}}, err =>{
          if(err) console.log(err);
          res.json({success: true, msg: 'post Deleted', post_id: req.params.id});
        })
      });
    } else {
      res.json({success: false, msg: 'so cute ☺'});
    }
  });

};

controller.UpdatePost = (req, res)=>{
  Posts.findById(req.params.id, (err, post)=>{
    if(err) console.log(err);
    if(post && post.user_id == req.user._id){
      Posts.findOneAndUpdate(
        {_id: req.params.id},
        {
          $set: {
            title: req.body.title || post.title,
            body: req.body.body || post.body,
            category_id: req.body.category_id || post.category_id,
            rtl: req.body.dir || post.dir,
            sanitizedHtml: dompurify.sanitize(marked(req.body.body))
          }
        }, (err)=>{
        if(err) res.json({error: err});
        res.json({msg: 'post Updated'});
      });
    } else {
      res.json({success: false, msg: 'so cute ☺'});
    }
  });
};


controller.LikeOrUnlike = (req, res)=>{
  Posts.findById(req.params.id, (err, post)=>{
    if(err) res.json({success: false, msg: 'something went wrong'});
    else if(post && post.likes.indexOf(req.user._id) < 0){
      Posts.findOneAndUpdate(
        {_id: req.params.id},
        {
          $push:{
            likes: req.user._id
          }
        },
        (err, post) => {
          if(err) res.json({success: false, msg: 'something went wrong'});
          if(req.user._id.toString() !== post.user_id.toString()){
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
                });
              });
            }
            Posts.findById(req.params.id, (err, post)=>{
              if(err) console.log(err);
              res.json({likes: post.likes, post_id: req.params.id});
            });
        });
    } else if(post && post.likes.indexOf(req.user._id) >= 0) {
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
};

controller.AddComment = (req, res)=>{
  console.log(req.body, req.params.id);
  Comments({
    user_id: req.user._id,
    comment_body: req.body.comment_body,
    comment_time: req.body.comment_time
  })
  .save((err, comment)=>{
    if(err) res.json({msg: err})
    Posts.update({_id: req.params.id}, {
      $push:{
        comments: comment._id
      }
    },
    err => {
      if(err) console.log(err);
      Comments.findById(comment._id)
      .populate({
        path: 'user_id',
        select: ['username', 'pic']
      })
      .exec((err, comment)=>{
        comment.user_id.pic = `http://${req.hostname}/${comment.user_id.pic}`;
        if (err) console.log(err);
        Posts.findById(req.params.id)
        .populate('comments')
        .exec((err, post)=>{
          if (err) console.log(err);
          let notifiedPersons = [];
          post.comments.forEach((c)=>{
             if(c.user_id.toString() != req.user._id.toString()){
               notifiedPersons.push(c.user_id.toString());
             }
          });
          if(req.user._id.toString() != post.user_id.toString()) notifiedPersons.push(post.user_id.toString())
          let nps = new Set(notifiedPersons);
          console.log([...nps]);
          if([...nps].length){
            Notifications({
              noti_type: 'comment',
              owner: [...nps],
              user_id: req.user._id,
              item_id: req.params.id,
              noti_text: 'commented on a post',
              noti_time: req.body.comment_time
            })
            .save((err, noti)=>{
              if(err) console.log(err);
              Users.updateMany({_id: {$in: [...nps]}},
                {$push: {
                  notifications: noti._id
                }},
                (err, data) =>{
                  if (err) console.log(err);
                  console.log(data);
                })
            })
          }
        })
        res.json({comment: comment, post_id: req.params.id})
      })
    })
  });
};


module.exports = controller;
