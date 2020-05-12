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
    type: String,
    default: 'male'
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
  notifications:[
    {
      type: schema.Types.ObjectId,
      ref: 'Notifications'
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
  },
  verificationNum: {
    type: Number,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  restPassNum:{
    type: Number
  },
  restPassExp: {
    type: String
  }
});
const Users = ( module.exports = mongoose.model('Users', userSchema) );
