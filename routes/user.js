const express = require('express')
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth')
const sharp = require('sharp')
const multer = require('multer');
const upload =  multer({
    limits:{
      fileSize:30000000
    },fileFilter(req,file,cb){
if(!file.originalname.match(/\.(jpg|jpeg|gif|png)$/)){
 return cb(new Error('please upload a picture'));

}
else{
  cb(undefined,true);
}
    }
})
router.post('/user/avatar/me',auth,upload.single('useravatar'), async (req,res)=>{
   const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
   req.user.avatar = buffer
   await req.user.save();
   res.send('pic updated',buffer);
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

// this is route is  used to delete a users avatar

router.delete('/user/avatar/me',auth,upload.single('useravatar'), async (req,res)=>{
  req.user.avatar = undefined
  await req.user.save();
  res.send('pic updated');
})


router.post('/user/signup',async (req,res)=>{
    try{
       const user = new User(req.body);
       const token =  await user.generateAuthToken()
      await user.save()  
      res.status(201).send({user,token})
    }
    catch(err){
       res.status(500).send(err)
    }
    }
 )
 
 router.post('/user/login',async (req,res)=>{
   try{
 const user = await User.findByCredentials(req.body.email,req.body.password);
const token =  await user.generateAuthToken()
 res.send({user,token});
   }
   catch(e){
res.status(500).send({message:"either email or password incorrect try again later"})
   }
 })

 router.post('/user/logout' ,async (req,res)=>{
   try{
req.user.tokens = req.user.tokens.filter((token)=>{
 return token.token !== req.token
});
  await req.user.save();
  res.send({message:'you have logged out'})
   }
   catch(err){
res.send({message:'error occured'});

   }
 })

 router.get('/user/me',auth,async (req,res)=>{
res.send(req.user)
     
 })



router.delete('/user/me',auth,async(req,res)=>{ 
try{

 req.user.remove()       
res.send(req.user);
}
catch(err){
 res.send({'message':'user not found'})
 }
        
});
        
router.patch('/user/me/',auth ,async (req,res)=>{
 //this helps to check if  the keyword to  be updated is a part of the models
 //if false it  returns  an error if true it continues with the updating process
         
const updates = Object.keys(req.body);
 const allowedupdates =['name','email','password','age'];
const isvalidoperation = updates.every((update)=>allowedupdates.includes(update))
 if(!isvalidoperation){
    res.status(400).send({'error':'this cant be updated '})
  }

try{

 updates.forEach((update)=>{
   req.user[update]= req.body[update]
 })
    await req.user.save();

  res.send(req.user)
 }
  catch(err){
  res.send(err);
  }
   })

   router.post('/user/logoutall', auth ,async (req,res)=>{
    try{
   req.user.tokens =[]
   await req.user.save();
   res.send({message:'logged out of all devices'});

    }
    catch(err){
 res.send({message:'login again to do this'});
 
    }
  })
module.exports = router