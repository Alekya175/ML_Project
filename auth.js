const jwt=require('jsonwebtoken'),{User}=require('../models');
exports.protect=async(req,res,next)=>{
 try{const t=(req.headers.authorization||'').replace('Bearer ','');if(!t)return res.status(401).json({message:'Please log in to continue.'});
 const {id}=jwt.verify(t,process.env.JWT_SECRET);req.user=await User.findById(id).select('-password');
 if(!req.user)return res.status(401).json({message:'Account not found.'});next();}
 catch{res.status(401).json({message:'Session expired. Please log in again.'})}};
exports.adminOnly=(req,res,next)=>req.user.role==='admin'?next():res.status(403).json({message:'Admin access required.'});
