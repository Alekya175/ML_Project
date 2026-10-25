const m=require('mongoose'),S=m.Schema,O=S.Types.ObjectId;
const T={timestamps:true};
exports.User=m.model('User',new S({name:String,email:{type:String,unique:true,lowercase:true},password:String,role:{type:String,default:'student'},
 department:String,year:Number,cgpa:Number,grades:String,skills:[String],interests:[String],completedCourses:[String],preferredDomains:[String],
 learningLevel:{type:String,default:'Beginner'},learningText:String,wantToLearn:[String],learningPreferences:{duration:String,mode:String,certification:Boolean,difficulty:String,weeklyHours:Number},
 profileComplete:{type:Boolean,default:false}},T));
exports.Course=m.model('Course',new S({courseId:{type:String,unique:true},name:String,category:String,description:String,skillsRequired:[String],
 difficulty:String,rating:Number,duration:String,weeks:Number,provider:String,domain:String,courseUrl:String},T));
exports.Recommendation=m.model('Recommendation',new S({userId:O,sessionId:String,domain:String,courseId:{type:O,ref:'Course'},contentScore:Number,collaborativeScore:Number,finalScore:Number,reason:String,matched:{}},T));
exports.SavedCourse=m.model('SavedCourse',new S({userId:O,courseId:{type:O,ref:'Course'},savedAt:{type:Date,default:Date.now}}));
exports.LearningPath=m.model('LearningPath',new S({userId:O,courseId:{type:O,ref:'Course'},status:{type:String,enum:['recommended','in-progress','completed'],default:'recommended'},progress:{type:Number,default:0},order:Number}));
