const express = require('express')
const router = new express.Router();
const Task = require('../models/task');
 const auth = require('../middleware/auth');
router.get('/tasks',auth,async (req,res)=>{
   const match ={}
   const sort ={}
// true and false are actually booleans 
// so req.query works like this
// if the req.query.completed === the string true 
// match.completed will actually return true 
// hence a boolean
// and if req.query.completed === false i.e the string false 
// match.completed === false hence fetching where the completed tasks is false
//hope you get this

   if(req.query.completed){
      match.completed = req.query.completed  === 'true'
   }

   // implemented a feature that makes get's his task in ascending or descending 
   //order
   if(req.query.sortBy){
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] ==='desc' ? -1: 1
      
      }
    try{
      await req.user.populate({
         path:'tasks',
         match,
         options:{
            // here implemented pagination in the app
           // here req.query.limit limits the number of tasks been sent to the user
           // i.e if somemones set req.query.limit = 2
           //  only 2 tasks is sent per user 
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
         }
      }).execPopulate();
      res.send(req.user.tasks)
    }
    catch(err){
      res.staus(500).send(err)
    }
 });
 router.post('/tasks',auth,async (req,res)=>{
    try {
       const task= new Task({
         ...req.body,
         owner: req.user._id
      })
     await task.save()
     res.status(201).json(task) 
    } catch (error) {
       res.status(404).json(error);
    }
    
    })
 
 
 
 
 router.delete('/tasks/:id',auth,async(req,res)=>{ 
   const _id = req.params.id
    try{
    // _ id means task id and 
    // owner: req.user._id is to get the tasks 
    // a particular user created 
    if(!_id){
      return res.status(400).send({ error:'please input the id'})
    }

    const task = await Task.findOneAndRemove({_id,owner:req.user._id})
    if(!task){
       res.status(404).send({message:'task  not found'});
    }
    
    res.status(200).json(task);
    }
    catch(err){
    res.status(500).json({'message':'task not found'})
    }
    
    });
    
    router.get('/tasks/:id',auth,async (req,res)=>{
       const _id = req.params.id
    try{
       const usertask = await Task.findOne({_id,owner:req.user._id});
       if(!usertask){
          res.status(404).json(usertask);
       }
       res.status(200).json(usertask)
    }
    catch(err){
 res.status(404).json(err);
    }
 })
 
 router.patch('/tasks/:id',auth,async (req,res)=>{
    //this helps to check if  the keyword to  be updated is a part of the models
    //if false it  returns  an error if true it continues with the updating process
    const updates = Object.keys(req.body);
    const allowedupdates =['description','completed'];
    const isvalidoperation = updates.every((update)=>allowedupdates.includes(update))
    if(!isvalidoperation){
       res.status(400).json({'error':'this cant be updated '})
    }
    const _id = req.params.id
 
 try{
    const task = await Task.findOne({_id,owner:req.user._id});
    if(!task){
       res.status(404).json('no TASK found');
    }
    updates.forEach((update)=>task[update]=req.body[update]);
    // saves the updtated tasks in the db

    await task.save()
    res.status(200).json(task)
 }
 catch(err){
 res.status(404).json(err);
 }
 })
 module.exports = router