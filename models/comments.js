const mongoose = require('mongoose');
const schema = mongoose.Schema;
let commentSchema = schema({
  user_id:{
    type: schema.Types.ObjectId,
    ref: 'Users'
  },
  comment_body:{
    type: String
  },
  comment_time:{
    type: String
  }
});
const Comments = ( module.exports = mongoose.model('Comments', commentSchema) );
