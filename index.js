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
const task_model = new mongoose.model('task', schema)
const user_schema = new mongoose.Schema({
    name: {
        type: String,
    }
})
const user_model = new mongoose.model('user', user_schema)

app.post('/add_task', async (req, res) => {
    try {
        await task_model.insertMany(req.body)
        res.status(200).json(result)
    }
    catch {
        res.json("Error " + error)
    }
})
app.get('/delete/:id', async (req, res) => {
    try {
        const result = await task_model.findOneAndDelete({ _id: req.params.id })
        if (result) {
            res.json({ status: true })
        }
        else {
            res.json({ status: false })
        }
    }
    catch {
        res.json("Error " + error)
    }
})
app.post('/login', async (req, res) => {
    try {
        let searchName = req.body.name.toLowerCase();
        let result = await user_model.findOne({ name: searchName })
        if (result) {
            req.session.user = result.name
            // res.redirect('/task')
            res.json({ status: true })
        }
    }
    catch {
        res.json("Error " + error)
    }
})
app.get('/task', async (req, res) => {
    let data = await task_model.find()
    // res.render("task", { data: data, session: req.session.user })
    res.json({ data, session: req.session.user })
})
app.post('/use', async (req, res) => {
    try {
        let user = req.session.user
        let id = req.body._id
        await task_model.updateOne({ _id: id }, { used: user })
        // res.redirect("/task")
        res.json({ status: true })
    }
    catch {
        res.json("Error " + error)
    }
})
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.json({ status: true })
})


app.get('/edit', async (req, res) => {
    const id = req.params.id
    const { title, body } = req.body
    try {
        const result = await task_model.findOneAndUpdate({ _id: id }, { title: title, body: body })
        res.status(200).json(result)
    } catch (error) {
        res.json("Error " + error)
    }

})

const port = 3000
app.listen(port, () => {
    console.log("Server running on port " + port)
})