const r=require('express').Router(),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),uuid=()=>require('crypto').randomUUID();
const {User,Course,Recommendation:Rec,SavedCourse,LearningPath}=require('../models'),{protect,adminOnly}=require('../middleware/auth'),rec=require('../services/recommender');
const wrap=f=>(q,s,n)=>Promise.resolve(f(q,s,n)).catch(n),bad=(s,m)=>s.status(400).json({message:m});
const token=u=>jwt.sign({id:u._id},process.env.JWT_SECRET,{expiresIn:'7d'});
const safe=u=>{const o=u.toObject?u.toObject():u;delete o.password;return o};
const DEPTS=['Artificial Intelligence & Machine Learning','Computer Science','Information Technology','Electronics & Communication','Electrical Engineering','Mechanical Engineering','Civil Engineering','Other'];

// ---- Auth
r.post('/auth/register',wrap(async(q,s)=>{const{name,email,password,department,year}=q.body;
 if(!name||!/^\S+@\S+\.\S+$/.test(email||''))return bad(s,'Enter a valid name and email.');
 if(!password||password.length<6)return bad(s,'Password must be at least 6 characters.');
 if(!DEPTS.includes(department))return bad(s,'Please choose a department.');
 if(await User.findOne({email:email.toLowerCase()}))return bad(s,'An account with this email already exists.');
 const u=await User.create({name,email,department,year,password:await bcrypt.hash(password,10)});s.status(201).json({token:token(u),user:safe(u)})}));
r.post('/auth/login',wrap(async(q,s)=>{const u=await User.findOne({email:String(q.body.email||'').toLowerCase()});
 if(!u||!(await bcrypt.compare(String(q.body.password||''),u.password)))return s.status(401).json({message:'Incorrect email or password.'});
 s.json({token:token(u),user:safe(u)})}));

// ---- Profile
r.get('/profile',protect,(q,s)=>s.json(q.user));
r.put('/profile',protect,wrap(async(q,s)=>{
 const f=['department','year','cgpa','grades','skills','interests','completedCourses','preferredDomains','learningLevel','learningText','wantToLearn','learningPreferences'],u={};
 f.forEach(k=>{if(q.body[k]!==undefined)u[k]=q.body[k]});
 if(u.cgpa!==undefined&&(u.cgpa<0||u.cgpa>10))return bad(s,'CGPA must be between 0 and 10.');
 const m={...q.user.toObject(),...u};u.profileComplete=!!(m.skills?.length&&(m.interests?.length||m.wantToLearn?.length)&&m.preferredDomains?.length&&m.learningLevel);
 s.json(await User.findByIdAndUpdate(q.user._id,u,{new:true}).select('-password'))}));

// ---- Courses
r.get('/courses',wrap(async(q,s)=>{const{q:search,category,difficulty,provider,domain,skill,minRating,maxWeeks,sort}=q.query,f={};
 if(search){const x=new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');f.$or=[{name:x},{skillsRequired:x},{category:x}]}
 if(category)f.category=String(category);if(difficulty)f.difficulty=String(difficulty);if(provider)f.provider=String(provider);if(domain)f.domain=String(domain);
 if(skill)f.skillsRequired=String(skill);if(minRating)f.rating={$gte:+minRating};if(maxWeeks)f.weeks={$lte:+maxWeeks};
 const order={rating:{rating:-1},duration:{weeks:1},recent:{createdAt:-1}}[sort]||{rating:-1};
 s.json(await Course.find(f).sort(order))}));
r.get('/courses/:id/match',protect,wrap(async(q,s)=>{const c=await Course.findById(q.params.id);if(!c)return s.status(404).json({message:'Course not found.'});
 const u=q.user,kw=[...new Set([...rec.extractKeywords(u.learningText||''),...(u.wantToLearn||[])])];
 const o=rec.recommend({...u.toObject(),completedCourses:[]},[c],await interactions(),kw,1)[0];s.json(o?{finalScore:o.finalScore,reason:o.reason,matched:o.matched}:null)}));
r.get('/courses/:id',wrap(async(q,s)=>{const c=await Course.findById(q.params.id);if(!c)return s.status(404).json({message:'Course not found.'});s.json(c)}));
r.post('/courses',protect,adminOnly,wrap(async(q,s)=>{const b=q.body;if(!b.name||!b.category)return bad(s,'Name and category are required.');
 s.status(201).json(await Course.create({...b,courseId:b.courseId||'C'+Date.now()}))}));
r.put('/courses/:id',protect,adminOnly,wrap(async(q,s)=>s.json(await Course.findByIdAndUpdate(q.params.id,q.body,{new:true}))));
r.delete('/courses/:id',protect,adminOnly,wrap(async(q,s)=>{await Course.findByIdAndDelete(q.params.id);s.json({ok:true})}));

// ---- Recommendations
const interactions=async()=>{const m=new Map(),add=(u,c)=>{u=String(u);if(!m.has(u))m.set(u,new Set());m.get(u).add(String(c))};
 (await SavedCourse.find()).forEach(x=>add(x.userId,x.courseId));(await LearningPath.find()).forEach(x=>add(x.userId,x.courseId));return m};
r.post('/recommendations/generate',protect,wrap(async(q,s)=>{
 const u=q.user;if(!u.skills?.length&&!u.interests?.length&&!q.body.text)return bad(s,'Complete your profile to receive more accurate recommendations.');
 const kw=[...new Set([...rec.extractKeywords(q.body.text||u.learningText||''),...(u.wantToLearn||[])])],courses=await Course.find();
 const out=rec.recommend(u,courses,await interactions(),kw),sessionId=uuid(),domain=(u.preferredDomains||[])[0]||'General';
 await Rec.insertMany(out.map(o=>({userId:u._id,sessionId,domain,courseId:o.course._id,contentScore:o.contentScore,collaborativeScore:o.collaborativeScore,finalScore:o.finalScore,reason:o.reason,matched:o.matched})));
 const top=out.slice(0,5),compat=top.length?Math.round(top.reduce((a,o)=>a+o.finalScore,0)/top.length):0;
 s.json({sessionId,extractedKeywords:kw,coursesAnalyzed:courses.length,profileCompatibility:compat,
  disclaimer:'Scores are relevance estimates from profile similarity, not a measured accuracy.',recommendations:out})}));
r.get('/recommendations',protect,wrap(async(q,s)=>{
 if(q.query.history){const all=await Rec.find({userId:q.user._id}).sort({createdAt:-1}).populate('courseId');const g={};
  all.forEach(x=>{(g[x.sessionId]=g[x.sessionId]||{sessionId:x.sessionId,date:x.createdAt,domain:x.domain,items:[]}).items.push(x)});return s.json(Object.values(g))}
 const last=await Rec.findOne({userId:q.user._id}).sort({createdAt:-1});if(!last)return s.json([]);
 s.json(await Rec.find({sessionId:last.sessionId}).sort({finalScore:-1}).populate('courseId'))}));

// ---- Saved courses & learning path
r.post('/courses/:id/save',protect,wrap(async(q,s)=>{await SavedCourse.updateOne({userId:q.user._id,courseId:q.params.id},{$setOnInsert:{savedAt:new Date()}},{upsert:true});s.status(201).json({saved:true})}));
r.delete('/courses/:id/save',protect,wrap(async(q,s)=>{await SavedCourse.deleteOne({userId:q.user._id,courseId:q.params.id});s.json({saved:false})}));
r.get('/saved-courses',protect,wrap(async(q,s)=>s.json(await SavedCourse.find({userId:q.user._id}).populate('courseId'))));
r.get('/learning-path',protect,wrap(async(q,s)=>s.json(await LearningPath.find({userId:q.user._id}).sort({order:1}).populate('courseId'))));
r.post('/learning-path',protect,wrap(async(q,s)=>{const{courseId,status,progress}=q.body;if(!courseId)return bad(s,'courseId is required.');
 const n=await LearningPath.countDocuments({userId:q.user._id}),set={};if(status)set.status=status;
 if(progress!==undefined)set.progress=Math.max(0,Math.min(100,+progress||0));if(status==='completed')set.progress=100;
 const op={$setOnInsert:{order:n+1}};if(Object.keys(set).length)op.$set=set;
 const d=await LearningPath.findOneAndUpdate({userId:q.user._id,courseId},op,{upsert:true,new:true}).populate('courseId');
 if(status==='completed'&&d.courseId)await User.updateOne({_id:q.user._id},{$addToSet:{completedCourses:d.courseId.name}});s.json(d)}));
r.delete('/learning-path/:courseId',protect,wrap(async(q,s)=>{await LearningPath.deleteOne({userId:q.user._id,courseId:q.params.courseId});s.json({ok:true})}));

// ---- Analytics (student + admin)
const count=a=>Object.entries(a.reduce((m,x)=>(m[x]=(m[x]||0)+1,m),{})).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
r.get('/analytics',protect,wrap(async(q,s)=>{const u=q.user,lp=await LearningPath.find({userId:u._id}),last=await Rec.findOne({userId:u._id}).sort({createdAt:-1});
 const recs=last?await Rec.find({sessionId:last.sessionId}).populate('courseId'):[];
 s.json({skills:(u.skills||[]).map(name=>({name,value:1})),interests:count(u.interests||[]),recommendedCategories:count(recs.map(x=>x.courseId&&x.courseId.category).filter(Boolean)),
  completion:{completed:lp.filter(x=>x.status==='completed').length,inProgress:lp.filter(x=>x.status==='in-progress').length,saved:await SavedCourse.countDocuments({userId:u._id})},
  learningProgress:lp.length?Math.round(lp.reduce((a,x)=>a+x.progress,0)/lp.length):0})}));
r.get('/admin/stats',protect,adminOnly,wrap(async(q,s)=>{const recs=await Rec.find().populate('courseId'),st=await User.find({role:'student'}).select('-password');
 s.json({totalStudents:st.length,totalCourses:await Course.countDocuments(),totalRecommendations:recs.length,
  avgScore:recs.length?Math.round(recs.reduce((a,x)=>a+x.finalScore,0)/recs.length):0,
  popularCategories:count(recs.map(x=>x.courseId&&x.courseId.category).filter(Boolean)),mostRecommended:count(recs.map(x=>x.courseId&&x.courseId.name).filter(Boolean)).slice(0,5),
  domains:count(recs.map(x=>x.domain)),popularSkills:count(st.flatMap(x=>x.skills)).slice(0,10)})}));
r.get('/admin/students',protect,adminOnly,wrap(async(q,s)=>s.json(await User.find({role:'student'}).select('-password'))));
module.exports=r;
