//models
let Posts = require('../models/posts');
let Comments = require('../models/comments');

let controller = {}
controller.DeleteComment = (req, res)=>{
  Comments.findById(req.params.comment_id, (err, comment)=>{
    if(err) {
      res.json({success: false, msg: 'something went wrong'});
    } else if (comment.user_id == req.user._id){
      Comments.deleteOne({_id: req.params.comment_id}, (err)=>{
        if (err) res.json({success: false, msg: 'something went wrong'});
        res.json({success: true, msg: 'comment deleted'});
      });
    } else {
      res.json({success: false, msg: 'so cute ☺'});
    }
  });
};

module.exports = controller
