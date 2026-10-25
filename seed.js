require('dotenv').config();
const mongoose=require('mongoose'),bcrypt=require('bcryptjs'),{User,Course,SavedCourse}=require('./models');
const rows=require('./dataset/courses.json');
(async()=>{await mongoose.connect(process.env.MONGO_URI);
 await Promise.all([User.deleteMany({}),Course.deleteMany({}),SavedCourse.deleteMany({})]);
 const cs=await Course.insertMany(rows.map(([name,category,domain,skills,difficulty,rating,weeks,provider],i)=>({courseId:'C'+String(i+1).padStart(3,'0'),name,category,domain,
  skillsRequired:skills.split(','),difficulty,rating,weeks,duration:weeks+' Weeks',provider,description:`${name}: a ${difficulty.toLowerCase()} ${category} course covering ${skills.split(',').join(', ')}.`,
  courseUrl:'https://www.google.com/search?q='+encodeURIComponent(name+' '+provider)})));
 const pw=await bcrypt.hash('password123',10),AI='Artificial Intelligence & Machine Learning';
 await User.create({name:'Admin',email:'admin@coursemate.ai',password:pw,role:'admin'});
 await User.create({name:'Demo Student',email:'demo@coursemate.ai',password:pw,department:AI,year:3,cgpa:8.5,skills:['Python','SQL','Machine Learning'],
  interests:['Artificial Intelligence','Data Science'],wantToLearn:['Deep Learning','NLP'],preferredDomains:['Artificial Intelligence'],learningLevel:'Intermediate',profileComplete:true});
 // Seed peer students so collaborative filtering has history to learn from
 const by=n=>cs.find(c=>c.name.includes(n))._id,peers=[['Machine Learning with Python','Deep Learning','Natural Language'],['Machine Learning with Python','Statistics','Computer Vision'],['Complete Machine Learning','Reinforcement','Capstone'],['SQL for Data','Machine Learning with Python','Capstone']];
 for(const[i,p]of peers.entries()){const u=await User.create({name:'Peer '+(i+1),email:`peer${i+1}@coursemate.ai`,password:pw,skills:['Python','Machine Learning'],interests:['Artificial Intelligence'],learningLevel:'Intermediate'});
  await SavedCourse.insertMany(p.map(n=>({userId:u._id,courseId:by(n)})))}
 console.log('Seeded. Demo: demo@coursemate.ai / password123   Admin: admin@coursemate.ai / password123');process.exit()})();
