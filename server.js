require('dotenv').config();
const express=require('express'),cors=require('cors'),mongoose=require('mongoose');
const app=express();
app.use(cors({origin:process.env.CLIENT_URL||'*'}));app.use(express.json({limit:'1mb'}));
app.use('/api',require('./routes'));
app.use((req,res)=>res.status(404).json({message:'Route not found'}));
app.use((err,req,res,next)=>{console.error(err);res.status(err.status||500).json({message:err.status?err.message:'Something went wrong. Please try again.'})});
mongoose.connect(process.env.MONGO_URI).then(()=>app.listen(process.env.PORT||5000,()=>console.log('API running')))
 .catch(e=>{console.error('MongoDB connection failed:',e.message);process.exit(1)});
