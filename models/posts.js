const mongoose = require('mongoose');
const schema = mongoose.Schema;
let postSchema = schema({
  title:{
    type: String,
    required: true
  },
  body:{
    type: String,
    required: true
  },
  created_at:{
    type: String,
    required: true
  },
  user_id:{
    type: schema.Types.ObjectId,
    ref: 'Users'
  },
  likes:[
    {
      type: schema.Types.ObjectId,
      ref: 'Users'
    }
  ],
  comments:[
    {
      user_id:{
        type: schema.Types.ObjectId,
        ref: 'Users'
      },
      comment_body:{
        type: String
      }
    }
  ],
  category_id:{
    type: schema.Types.ObjectId,
    ref: 'Categories'
  }
});
const Posts = ( module.exports = mongoose.model('Posts', postSchema) );
