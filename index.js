const express = require("express")
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')

app.use(session({
    secret: "secretKey",
    cookie: { maxAge: 200000 },
    resave: false,
    Uninitialized: true,
}))
app.set('view engine', 'ejs')
app.set('views', __dirname + '/view')
app.use(express.urlencoded({ extended: true }))
mongoose.connect('mongodb+srv://Beki:78122775Beki@cluster0.6ypmi.mongodb.net/task')
    .then(console.log("DB connected"))
const schema = new mongoose.Schema({
    text: {
        type: String,
    },
    used: {
        type: String,
    }
})
const collection = new mongoose.model('task', schema)

app.get('/', (req, res) => {
    res.render("index", { session: req.session.user })
})
app.get('/add', (req, res) => {
    res.render("add", { session: req.session.user })
})
app.post('/add', async (req, res) => {
    await collection.insertMany(req.body)
    res.redirect('/task')
})
app.post('/login', (req, res) => {
    let name = req.body.name.toLowerCase();
    if (name == "bob" || name == "alex" || name == "nick") {
        req.session.user = name
        res.redirect('/task')
    }
    else { res.redirect('/') }
})
app.get('/task', async (req, res) => {
    let data = await collection.find()
    res.render("task", { data: data, session: req.session.user })
})
app.post('/use', async (req, res) => {
    let user = req.session.user
    let id = req.body.id
    await collection.updateOne({ _id: id }, { used: user })
    res.redirect("/task")
})
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect("/")
})

const port = 3000
app.listen(port, () => {
    console.log("Server running on port " + port)
})