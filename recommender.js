// Hybrid recommender: content-based (TF cosine) + collaborative (user-user cosine) + level match.
const STOP=new Set('i am in and want to learn the a of interested on with for my about is like would'.split(' '));
const ALIAS={ai:'artificial intelligence',ml:'machine learning',dl:'deep learning',js:'javascript',cv:'computer vision',cpp:'c++'};
const KEYWORDS=['python','java','c++','javascript','react','sql','machine learning','deep learning','data science','data analytics','cloud computing','cybersecurity',
 'web development','nlp','computer vision','devops','artificial intelligence','ui/ux','aws','docker','statistics','node.js','mongodb'];
const LEVELS=['Beginner','Intermediate','Advanced'];
const norm=s=>(s||'').toLowerCase().replace(/\b(ai|ml|dl|js|cv|cpp)\b/g,w=>ALIAS[w]);
const tokens=s=>norm(s).replace(/[^a-z0-9+#./ ]/g,' ').split(/\s+/).filter(w=>w&&!STOP.has(w));
const vec=(text,w=1,v=new Map())=>{tokens(text).forEach(t=>v.set(t,(v.get(t)||0)+w));return v};
const cosine=(a,b)=>{let d=0,na=0,nb=0;for(const[k,x]of a){na+=x*x;if(b.has(k))d+=x*b.get(k)}for(const x of b.values())nb+=x*x;return na&&nb?d/Math.sqrt(na*nb):0};

// NLP step: pull known skill/topic keywords from free text ("Tell us what you want to learn")
exports.extractKeywords=text=>{const t=norm(text);return KEYWORDS.filter(k=>t.includes(k))};

const studentVec=(u,extra=[])=>{const v=new Map();
 vec((u.skills||[]).join(' '),2,v);vec((u.interests||[]).join(' '),1.5,v);vec((u.preferredDomains||[]).join(' '),1.5,v);
 vec(extra.join(' '),2,v);vec(u.department,.5,v);return v};
const courseVec=c=>{const v=new Map();vec(c.skillsRequired.join(' '),2,v);vec(c.category+' '+c.domain,1.5,v);vec(c.name,1.5,v);vec(c.description,.5,v);return v};
const levelMatch=(s,c)=>{const d=Math.abs(LEVELS.indexOf(s)-LEVELS.indexOf(c));return d===0?1:d===1?.5:0};

// interactions: Map<userId, Set<courseId>> (saved + learning path). Returns courseId -> 0..1
const collaborative=(uid,interactions)=>{const mine=interactions.get(uid)||new Set(),score=new Map();
 if(!mine.size)return score;
 for(const[other,set]of interactions){if(other===uid)continue;
  let inter=0;for(const c of set)if(mine.has(c))inter++;
  const sim=inter/Math.sqrt(mine.size*set.size);if(!sim)continue;
  for(const c of set)if(!mine.has(c))score.set(c,(score.get(c)||0)+sim)}
 for(const[c,s]of score)score.set(c,Math.min(1,s));return score};

exports.recommend=(user,courses,interactions,extraKeywords=[],limit=12)=>{
 const sv=studentVec(user,extraKeywords),collab=collaborative(String(user._id),interactions);
 const done=new Set((user.completedCourses||[]).map(x=>x.toLowerCase()));
 const have=new Set((user.skills||[]).map(x=>x.toLowerCase()));
 return courses.filter(c=>!done.has(c.name.toLowerCase())).map(c=>{
  const hayW=(c.category+' '+c.domain+' '+c.name+' '+c.skillsRequired.join(' ')).toLowerCase(),nW=extraKeywords.filter(k=>hayW.includes(k.toLowerCase())).length,content=Math.min(1,cosine(sv,courseVec(c))*1.6+0.12*nW),col=collab.get(String(c._id))||0,lvl=levelMatch(user.learningLevel,c.difficulty);
  const finalScore=Math.round((0.7*content+0.2*col+0.1*lvl)*100);
  const skills=c.skillsRequired.filter(s=>have.has(s.toLowerCase()));
  const hay=(c.category+' '+c.domain+' '+c.name).toLowerCase();
  const interests=(user.interests||[]).filter(i=>tokens(i).some(t=>hay.includes(t)));
  const domain=(user.preferredDomains||[]).filter(d=>d.toLowerCase()===c.domain.toLowerCase());
  const wanted=extraKeywords.filter(k=>hay.includes(k.toLowerCase())||c.skillsRequired.some(s=>s.toLowerCase()===k.toLowerCase()));
  const parts=[];
  if(skills.length)parts.push(`matches ${skills.length} of your skills (${skills.join(', ')})`);
  if(interests.length)parts.push(`fits your interest in ${interests.join(', ')}`);
  if(domain.length)parts.push(`is in your preferred domain (${domain[0]})`);
  if(wanted.length)parts.push(`covers what you want to learn (${wanted.join(', ')})`);
  if(lvl===1)parts.push(`suits your ${c.difficulty.toLowerCase()} level`);
  if(col>0)parts.push('was chosen by students with similar learning patterns');
  return{course:c,contentScore:Math.round(content*100),collaborativeScore:Math.round(col*100),finalScore,
   reason:parts.length?`This course ${parts.join(', ')}.`:'Suggested to broaden your profile.',matched:{skills,interests,domain,wanted,levelMatched:lvl===1}};
 }).sort((a,b)=>b.finalScore-a.finalScore||b.course.rating-a.course.rating).slice(0,limit)};
