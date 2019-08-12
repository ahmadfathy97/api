const mongoose = require('mongoose');
const schema = mongoose.Schema;
let userSchema = schema({
  username:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  pic:{
    type: String,
    required: true
  },
  info:{
    type: String,
    required: true
  },
  dayOfBirth:{
    type: String,
    required: true
  },
  followers:[
    {
      type: schema.Types.ObjectId,
      ref: 'Users'
    }
  ],
  following:[
    {
      type: schema.Types.ObjectId,
      ref: 'Users'
    }
  ]
});
const Users = ( module.exports = mongoose.model('Users', userSchema) );
