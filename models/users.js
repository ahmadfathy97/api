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
  gender:{
    type: String
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
  ],
  exp_time:{
    type: String
  },
  temp_id:{
    type: String
  },
  archive:{
    type: Boolean,
    default: false
  },
  admin:{
    default: false
  }
});
const Users = ( module.exports = mongoose.model('Users', userSchema) );
