import {useEffect,useState} from 'react';import {Link,useParams} from 'react-router-dom';import {ExternalLink} from 'lucide-react';
import {api} from '../services/api';import {useAuth} from '../context/AuthContext';import {Ring,btn} from '../components/ui';import CourseActions from '../components/CourseActions';import {useLearning} from '../services/useLearning';
export default function CourseDetail(){const{id}=useParams(),{user}=useAuth(),L=useLearning(),[c,setC]=useState(null),[m,setM]=useState(null),[err,setErr]=useState('');
 useEffect(()=>{setC(null);api('/courses/'+id).then(setC).catch(e=>setErr(e.message));api(`/courses/${id}/match`).then(setM).catch(()=>{})},[id]);
 if(err)return <p className="p-16 text-center text-red-600">{err} <Link className="underline" to="/courses">Back to courses</Link></p>;if(!c)return <p className="p-16 text-center text-slate-500">Loading…</p>;
 const have=new Set((user.skills||[]).map(s=>s.toLowerCase())),has=c.skillsRequired.filter(s=>have.has(s.toLowerCase())),need=c.skillsRequired.filter(s=>!have.has(s.toLowerCase())),chip="rounded-full px-3 py-1 text-sm font-medium";
 return <main className="mx-auto max-w-3xl px-4 py-10"><Link to="/courses" className="text-sm font-semibold text-indigo-600">Back to courses</Link>
 <div className="mt-4 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-100"><div className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-extrabold text-slate-900">{c.name}</h1>
  <p className="mt-1 text-sm text-slate-500">{c.provider} · {c.category} · {c.difficulty} · {c.duration} · {c.rating} ★</p></div>{m&&<Ring v={m.finalScore} size={80}/>}</div>
  <p className="mt-5 text-slate-600">{c.description}</p>
  {m&&<div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold">Why it is recommended</p><p className="mt-1 text-sm text-slate-600">{m.reason}</p></div>}
  <h2 className="mt-6 font-bold">Skills you already have</h2><div className="mt-2 flex flex-wrap gap-2">{has.length?has.map(s=><span key={s} className={chip+' bg-emerald-100 text-emerald-800'}>{s}</span>):<span className="text-sm text-slate-500">None of the required skills yet.</span>}</div>
  <h2 className="mt-5 font-bold">Skills you will learn</h2><div className="mt-2 flex flex-wrap gap-2">{need.length?need.map(s=><span key={s} className={chip+' bg-amber-100 text-amber-800'}>{s}</span>):<span className="text-sm text-slate-500">You already have them all.</span>}</div>
  <CourseActions c={c} L={L} detail/><a href={c.courseUrl} target="_blank" rel="noreferrer" className={btn+' mt-3'}><ExternalLink size={16}/>Visit Course Website</a></div></main>}
