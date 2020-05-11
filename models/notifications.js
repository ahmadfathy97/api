const mongoose = require('mongoose');
const schema = mongoose.Schema;
let notificationSchema = schema({
  noti_type:{
    type: String,
    required: true
  },
  user_id:{
    type: schema.Types.ObjectId,
    required: true,
    ref: 'Users'
  },
  item_id: {
    type: schema.Types.ObjectId,
    required: true
  },
  owner: [
    {
      type: schema.Types.ObjectId,
      required: true
    }
  ],
  noti_text:{
    type: String,
    required: true
  },
  noti_time:{
    type: String,
    required: true
  },
  readed: {
    type: Boolean,
    default: false
  }
});
const Notifications = ( module.exports = mongoose.model('Notifications', notificationSchema) );
