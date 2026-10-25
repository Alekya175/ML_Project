import {useState} from 'react';import {useNavigate} from 'react-router-dom';import {api} from '../services/api';import {useAuth} from '../context/AuthContext';
import {Chips,Field,inp,btn,btn2,DEPTS} from '../components/ui';
const SKILLS=['Python','Java','C','C++','JavaScript','React','SQL','Machine Learning','Deep Learning','Data Science','Data Analytics','Cloud Computing','Cybersecurity','Web Development','UI/UX','Communication'];
const INTERESTS=['Artificial Intelligence','Machine Learning','Data Science','Web Development','App Development','Cloud Computing','Cybersecurity','Data Analytics','Software Engineering','Business','Finance','Digital Marketing','UI/UX'];
const DOMAINS=['Artificial Intelligence','Data','Web','Cloud','Security','Software Engineering','Design'];
const WANTS=['Artificial Intelligence','Machine Learning','Deep Learning','NLP','Computer Vision','Data Science','Data Analytics','SQL','Web Development','Full Stack Development','Cloud Computing','DevOps','Cybersecurity','Java','C++','UI/UX'];
const TITLES=['Academic information','Technologies you already know','Interests and what you want to learn','Preferred domain','Learning level','Learning preferences'];
export default function ProfileSetup(){const{user,refresh}=useAuth(),nav=useNavigate(),[step,setStep]=useState(0),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[custom,setCustom]=useState('');
 const[f,setF]=useState({department:user.department||DEPTS[0],year:user.year||1,cgpa:user.cgpa??'',grades:user.grades||'',completed:(user.completedCourses||[]).join(', '),skills:user.skills||[],wants:user.wantToLearn||[],interests:user.interests||[],domains:user.preferredDomains||[],level:user.learningLevel||'Beginner',text:user.learningText||'',
  prefs:{duration:'Any',mode:'Online',certification:true,difficulty:'Balanced',weeklyHours:5,...(user.learningPreferences||{})}});
 const up=k=>v=>setF({...f,[k]:v}),P=(k,v)=>setF({...f,prefs:{...f.prefs,[k]:v}});
 const check=()=>{if(step===0&&f.cgpa!==''&&(+f.cgpa<0||+f.cgpa>10))return'CGPA must be between 0 and 10.';
  if(step===1&&!f.skills.length)return'Choose at least one skill.';if(step===2&&!f.interests.length&&!f.wants.length&&!f.text.trim())return'Choose at least one interest or a topic you want to learn.';if(step===3&&!f.domains.length)return'Choose at least one domain.'};
 const next=()=>{const m=check();setErr(m||'');if(!m)setStep(step+1)};
 const finish=async()=>{setBusy(true);setErr('');try{
  await api('/profile',{method:'PUT',body:{department:f.department,year:+f.year,cgpa:f.cgpa===''?undefined:+f.cgpa,grades:f.grades,completedCourses:f.completed.split(',').map(s=>s.trim()).filter(Boolean),skills:f.skills,wantToLearn:f.wants,interests:f.interests,preferredDomains:f.domains,learningLevel:f.level,learningText:f.text,learningPreferences:f.prefs}});
  await refresh();await api('/recommendations/generate',{method:'POST',body:{text:f.text}});nav('/recommendations')}catch(e){setErr(e.message);setBusy(false)}};
 const addCustom=()=>{const s=custom.trim();if(s&&!f.skills.includes(s))up('skills')([...f.skills,s]);setCustom('')};
 const body=[
  <div className="grid gap-4 sm:grid-cols-2" key="0"><Field label="Department"><select className={inp} value={f.department} onChange={e=>up('department')(e.target.value)}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></Field>
   <Field label="Year"><select className={inp} value={f.year} onChange={e=>up('year')(e.target.value)}>{[1,2,3,4,5].map(y=><option key={y}>{y}</option>)}</select></Field>
   <Field label="CGPA (0–10)"><input type="number" step="0.01" className={inp} value={f.cgpa} onChange={e=>up('cgpa')(e.target.value)}/></Field>
   <Field label="Grades (optional)"><input className={inp} placeholder="e.g. A in Mathematics" value={f.grades} onChange={e=>up('grades')(e.target.value)}/></Field>
   <div className="sm:col-span-2"><Field label="Completed courses (comma separated)"><input className={inp} value={f.completed} onChange={e=>up('completed')(e.target.value)}/></Field></div></div>,
  <div key="1" className="space-y-4"><Chips options={[...new Set([...SKILLS,...f.skills])]} value={f.skills} onChange={up('skills')}/>
   <div className="flex gap-2"><input className={inp} placeholder="Add a custom skill" value={custom} onChange={e=>setCustom(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addCustom())}/><button type="button" onClick={addCustom} className={btn2}>Add</button></div></div>,
  <div key="2" className="space-y-5"><div><p className="mb-2 font-semibold">Your interests</p><Chips options={INTERESTS} value={f.interests} onChange={up('interests')}/></div><div><p className="mb-2 font-semibold">Which courses or topics do you want to learn?</p><Chips options={WANTS} value={f.wants} onChange={up('wants')}/></div>
   <Field label="Tell us what you want to learn (optional)"><textarea rows={3} className={inp} placeholder="I am interested in AI and want to learn Python and machine learning." value={f.text} onChange={e=>up('text')(e.target.value)}/></Field></div>,
  <div key="3"><p className="mb-3 font-semibold">Which domain are you most interested in?</p><Chips options={DOMAINS} value={f.domains} onChange={up('domains')}/></div>,
  <div key="4" className="grid gap-3 sm:grid-cols-3">{['Beginner','Intermediate','Advanced'].map(l=><button type="button" key={l} aria-pressed={f.level===l} onClick={()=>up('level')(l)} className={`rounded-2xl border p-5 text-left font-semibold ${f.level===l?'border-indigo-600 bg-indigo-50 text-indigo-700':'border-slate-200'}`}>{l}</button>)}</div>,
  <div key="5" className="grid gap-4 sm:grid-cols-2">
   <Field label="Preferred duration"><select className={inp} value={f.prefs.duration} onChange={e=>P('duration',e.target.value)}>{['Any','Under 4 weeks','4–8 weeks','8+ weeks'].map(x=><option key={x}>{x}</option>)}</select></Field>
   <Field label="Mode"><select className={inp} value={f.prefs.mode} onChange={e=>P('mode',e.target.value)}>{['Online','Offline','Either'].map(x=><option key={x}>{x}</option>)}</select></Field>
   <Field label="Difficulty preference"><select className={inp} value={f.prefs.difficulty} onChange={e=>P('difficulty',e.target.value)}>{['Easier','Balanced','Challenging'].map(x=><option key={x}>{x}</option>)}</select></Field>
   <Field label="Weekly learning time (hours)"><input type="number" min="1" max="60" className={inp} value={f.prefs.weeklyHours} onChange={e=>P('weeklyHours',+e.target.value)}/></Field>
   <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={f.prefs.certification} onChange={e=>P('certification',e.target.checked)}/>I want a certificate</label></div>];
 return <main className="mx-auto max-w-2xl px-4 py-10"><p className="text-sm font-semibold text-indigo-600">Step {step+1} of {TITLES.length}</p>
 <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-600 transition-all" style={{width:`${(step+1)/TITLES.length*100}%`}}/></div>
 <h1 className="mt-5 text-2xl font-extrabold text-slate-900">{TITLES[step]}</h1><div className="mt-6 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">{body[step]}</div>
 {err&&<p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
 <div className="mt-6 flex justify-between"><button disabled={step===0||busy} onClick={()=>setStep(step-1)} className={btn2}>Back</button>
 {step<TITLES.length-1?<button onClick={next} className={btn}>Continue</button>:<button disabled={busy} onClick={finish} className={btn}>{busy?'Analyzing…':'Analyze My Profile'}</button>}</div></main>}
