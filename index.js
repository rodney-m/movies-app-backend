const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');


const app = express();

app.use(cors({
    origin: '*'
}));


// Middleware
app.use(express.json());
app.use(morgan('tiny'));


// routes
const userRoutes = require('./routes/users');

const api = process.env.API_URL

app.use(`${api}/users`, userRoutes);



// database

mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
    console.log('Database Connection is ready...');
})
.catch((err) => {
    console.log(err)
})


app.listen(5000, () => {
    console.log("Listening on port 5000");
})