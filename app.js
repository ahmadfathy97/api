const express = require('express');
// app init
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/database.js');

const path = require('path');
const dotEnv = require('dotenv');
dotEnv.config();

const cors = require('cors');
app.use(cors());

// for history mode
// const history = require('connect-history-api-fallback');
// app.use(history());

const verify = require('./middlewares/verifyToken');
// set the port
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

//connect with database
mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('connected', () => {
  console.log(`============================= \n|| Database  Is  Connected ||\n============================= \n`);
});
mongoose.connection.on('error', (error) => {
  console.log('Something Went Worng!!', error)
});

//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//api
app.use('/api/posts/', require('./routes/posts.js'));
app.use('/api/categories/', require('./routes/categories.js'));
app.use('/api/users/', require('./routes/users.js'));
app.use('/api/auth/', require('./routes/auth.js'));
app.use('/api/search/', require('./routes/search.js'));
app.use('/api/comments/', require('./routes/comments.js'));

app.listen(port, ()=>{
  console.log(`============================== \n||the app is running at ${port}||\n============================== \n`);
});
