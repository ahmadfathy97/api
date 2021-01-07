const mongoose = require('mongoose');
const schema = mongoose.Schema;
let categorySchema = schema({
  category_name:{
    type: String,
    required: true
  },
  category_pic:{
    type: String,
    required: true
  },
  category_info:{
    type: String,
    required: true
  }
}, {timestamps: true});
const Categories = ( module.exports = mongoose.model('Categories', categorySchema) );
