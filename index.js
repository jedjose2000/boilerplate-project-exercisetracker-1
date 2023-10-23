const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
mongoose = require('mongoose');
let bodyParser = require('body-parser');
const dns = require('node:dns');
let uri = 'mongodb+srv://jedjose2000:hyPhvDwFltCj0Wkb@cluster0.cf7vwhh.mongodb.net/db_freeCodeCamp?retryWrites=true&w=majority'

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// let UserSchema = new mongoose.Schema({
//   user_id: { type: String, required: true, unique: true },
//   username: { type: String, required: true, unique: true }
// })


// let ExerciseTrackerSchema = new mongoose.Schema({
//   user_id: { type: String, required: true },
//   description: { type: String, required: true }
// })



app.use("/", bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


app.post('/api/users', (req, res) => {
  let username = req.body.username;
  res.json({username: username})
});



