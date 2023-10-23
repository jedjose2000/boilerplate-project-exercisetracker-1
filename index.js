const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
mongoose = require('mongoose');
let bodyParser = require('body-parser');
const dns = require('node:dns');
let uri = 'mongodb+srv://jedjose2000:hyPhvDwFltCj0Wkb@cluster0.cf7vwhh.mongodb.net/db_freeCodeCamp?retryWrites=true&w=majority'

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


let UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
})

let userModel = mongoose.model('userModel', UserSchema)

let ExerciseTrackerSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date:{type: Date, default: new Date()}
})

let exerciseTrackerModel = mongoose.model('exerciseTrackerModel', ExerciseTrackerSchema)

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
  userModel.find({ username: username })
  .exec()
  .then(data => {
    if (data.length === 0) {
      let dbUser = new userModel({username:username});
      dbUser.save();
      res.json(dbUser);
    } else {
      res.json({ error: 'Username already exists!' });
    }
  })
  .catch(err => {
    res.json({ error: 'An error occurred while saving the data' });
  });
});


app.get('/api/users', (req, res) => {
  userModel.find({})
  .exec()
  .then(data => {
    res.json(data);
  })
  .catch(err => {
    res.json({ error: 'An error occurred while searching for the data' });
  });
});


app.post('/api/users/:_id/exercises', (req, res) => {
  let date = req.body.date;
  let userId = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let exerciseObj = {
    user_id: userId,
    description: description,
    duration: duration,
  }
  userModel.find({_id: userId})
  .exec()
  .then(data => {
    if (data.length === 0) {
      res.json({ error: 'No User found!' });
    } else {
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.json({ error: 'Incorrect date format. Please use yyyy-mm-dd format' });
      } else if (isNaN(duration)) {
        res.json({ error: 'Incorrect duration' });
      } else {
        if (date === '') {
          exerciseObj.date = new Date();
        } else if (date) {
          exerciseObj.date = new Date(date);
        }
        let dbExercise = new exerciseTrackerModel(exerciseObj);
        dbExercise.save();
        res.json({
          _id: data[0]._id,
          username: data[0].username,
          description: dbExercise.description,
          date: dbExercise.date.toDateString(),
          duration: dbExercise.duration,
        });
      }
    }
  })
  .catch(err => {
    res.json({ error: 'An error occurred while searching for the data' });
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;

  let fromParam = req.query.from;
  let toParam = req.query.to;
  let limitParam = req.query.limit;

  limitParam = limitParam ? parseInt(limitParam) : limitParam;

  let queryObject = {user_id: userId}

  if(fromParam || toParam){
    queryObject.date = {};
    if(fromParam){
      queryObject.date.$gte = new Date(fromParam);
    }
    if(toParam){
      queryObject.date.$lte = new Date(toParam);
    }
  }

  userModel.findById(userId)
    .exec()
    .then(userResult => {
      if (!userResult) {
        res.json({ error: 'No User found' });
      } else {
        exerciseTrackerModel.find(queryObject)
          .limit(limitParam)
          .exec()
          .then(exerciseResults => {
            const log = exerciseResults.map(exercise => ({
              description: exercise.description,
              duration: exercise.duration,
              date: exercise.date.toDateString(),
            }));


            const responseData = {
              _id: userResult._id,
              username: userResult.username,
              from: fromParam ? new Date(fromParam).toDateString() : undefined,
              to: toParam ? new Date(toParam).toDateString() : undefined,
              count: exerciseResults.length,
              log: log,
            };


            res.json(responseData);
          })
          .catch(err => {
            res.json({ error: 'An error occurred while searching for exercise data' });
          });
      }
    })
    .catch(err => {
      res.json({ error: 'An error occurred while searching for user data' });
    });
});





