require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4000;

// database cofiguration
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })
const db = mongoose.connection;
db.on('error', err => console.log(err));
db.once('open', () => console.log("Connected to database"));

// middlewares

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    session({
        secret: "secret",
        saveUninitialized: true,
        resave: false
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});


app.use(express.static('uploads'))

// set ejs
app.set('view engine', 'ejs');

// route
app.use('', require('./routes/routes.js'));

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
})