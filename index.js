const logger = require('morgan');
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const port = process.env.port|| 3000
const userroutes = require('./routes/user')
const taskroutes = require('./routes/task')
const cors = require('cors')
app.use(express.json());
//use user routes
app.use(userroutes);
// use task routes
app.use(cors())
app.use(logger('dev')); 
app.use(taskroutes);
app.listen(port,()=>{
    console.log(`server is listening on ${port}`)
})


mongoose.connect(
    'mongodb://127.0.0.1:27017/task-manager-api'
).then(console.log('database don connect'))
.catch(err=>console.log(err))
