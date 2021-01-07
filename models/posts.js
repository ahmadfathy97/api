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
  dir:{
    type: String,
    default: "ltr"
  },
  sanitizedHtml:{
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
      type: schema.Types.ObjectId,
      ref: 'Comments'
    }
  ],
  category_id:{
    type: schema.Types.ObjectId,
    ref: 'Categories'
  }
}, {timestamps: true});
// postSchema.pre('validate', function(next){
//   if(this.body){
//     this.sanitizedHtml = dompurify.sanitize(marked(this.body))
//   }
//   next()
// })
const Posts = ( module.exports = mongoose.model('Posts', postSchema) );
