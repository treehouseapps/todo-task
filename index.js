const express = require("express")
const jwt = require("jsonwebtoken");
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const bodyParser = require("body-parser")
const cors = require('cors');

const User = require('./models/User.js')
const Task = require('./models/Task.js')

const JWT_SECRET = "SUPADOPAGang"
app.use(cors());
app.use(
  cors({
    origin: true, 
    credentials: true, // Allow cookies and credentials for jwt
  })
);

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(express.json());

// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://Beki:78122775Beki@cluster0.6ypmi.mongodb.net/task')
  .then(console.log("DB connected"))

// custom middleware
// this checks if a user is logged in or not 

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if(!authHeader) {
    return res.status(401).json({ status: { code: 401, message: "Bad Request!" }, error: "Authorization header is required" });
  }
  const token = authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Authentication token is required." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Cannot verify the token")
      return res.status(403).json({ error: "Invalid or Expired Token" })
    }

    req.user = user
    next()
  })
}

app.get('/api/tasks', verifyToken, async (req, res) => {
  try {
    const use = await User.find()
    const data = await Task.find().populate("user").sort({ $natural: -1 })

    res.status(200).json({ data, user: req.user, result: true })
  } catch (err) {
    res.status(500).json({ err: err, message: err.message })
  }
})

app.post('/api/tasks', async (req, res) => {
  try {
    const { name, status, uploadedBy } = req.body

    if(!name || name === '') {
      return res.status(403).json({ error: "Bad request" })
    }

    const response = await new Task({name, status, uploadedBy}).save()
    //get latest tasks and sorts in reverse to make the recent added task apear on top 
    const data = await Task.find().populate("user").sort({ $natural: -1 }) 

  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err, result: false })
  }
})

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await Task.findOneAndDelete({ _id: req.params.id })
    const data = await Task.find().populate("user").sort({ $natural: -1 })

    res.json({ result: true, data })

  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err, result: false })
  }
})

// patch updates the specific body part only
app.patch('/api/tasks/:name', async (req, res) => {
  try {
    let taskName = req.params.name
    const taskTaken = await Task.findOne({ name: taskName })


    if(taskTaken.status===req.body.status) {
      return res.status(403).json({ error: "Bad request", data: taskTaken })
    }

    if(req.body.status === 'free') req.body.user = null

    const patchedData = await Task.findOneAndUpdate({name: taskName}, { status: req.body.status, user: req.body.user }, { new: true })
    const updatedData = await Task.find().populate("user").sort({ $natural: -1 })
    res.status(200).json({ result: true, data: updatedData })
  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err, result: false })
  }
})


app.post('/api/login', async (req, res) => {
  try {
    if (!req.body.name) {
      console.log("USERNAME IS REQUIRED")
      return res.status(400).json({ error: "Name is required." });
    }

    let name = req.body.name.toLowerCase();
    let result = await User.findOne({ name })

    if (!result) {
      console.log("USER NOT FOUND")
      return res.status(404).json({ error: "User not found." });
    }

    const token = jwt.sign({ user: result.name, id: result._id }, JWT_SECRET, { expiresIn: "24hr" })
    res.status(200).json({ messsage: "Login Successful.", token, user: result })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Server error." })
  }
})

app.get('/api/logout', (req, res) => {
  req.session.destroy()
  res.json({ status: true })
})

app.get("/api/auth_check", verifyToken, async (req, res) => {
  try {
    res.status(200).json({ message: "User has logged in" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Network error." })
  }
})
// app.get('/api_edit', async (req, res) => {
//     const id = req.params.id
//     const { title, body } = req.body
//     try {
//         const result = await task_model.findOneAndUpdate({ _id: id }, { title: title, body: body })
//         res.status(200).json(result)
//     } catch (error) {
//         res.json("Error " + error)
//     }

// })

const port = 4000
app.listen(port, () => {
  console.log("Server running on port " + port)
})