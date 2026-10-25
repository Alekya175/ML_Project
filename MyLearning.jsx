import {useEffect,useState} from 'react';import {Link} from 'react-router-dom';import {Check} from 'lucide-react';import {api} from '../services/api';import {btn,btn2} from '../components/ui';
const Bar=({v})=><div className="h-2 rounded-full bg-slate-100" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded-full bg-indigo-600 transition-all" style={{width:v+'%'}}/></div>;
const Empty=({t,c})=><div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center"><p className="font-semibold">{t}</p><Link to="/courses" className={btn+' mt-4'}>{c}</Link></div>;
export default function MyLearning(){const[tab,setTab]=useState('courses'),[path,setPath]=useState([]),[saved,setSaved]=useState([]),[err,setErr]=useState(''),[load,setLoad]=useState(true);
 const reload=async()=>{try{const[p,s]=await Promise.all([api('/learning-path'),api('/saved-courses')]);setPath(p.filter(x=>x.courseId));setSaved(s.filter(x=>x.courseId))}catch(e){setErr(e.message)}setLoad(false)};
 useEffect(()=>{reload()},[]);
 const act=async f=>{setErr('');try{await f();await reload()}catch(e){setErr(e.message)}};
 const upd=(id,b)=>act(()=>api('/learning-path',{method:'POST',body:{courseId:id,...b}})),rm=id=>act(()=>api('/learning-path/'+id,{method:'DELETE'})),unsave=id=>act(()=>api(`/courses/${id}/save`,{method:'DELETE'}));
 const enrolled=path.filter(x=>x.status!=='recommended'),done=path.filter(x=>x.status==='completed').length,avg=enrolled.length?Math.round(enrolled.reduce((a,x)=>a+x.progress,0)/enrolled.length):0,nextId=path.find(x=>x.status==='recommended')?._id;
 const inPath=Object.fromEntries(path.map(x=>[x.courseId._id,x]));
 if(load)return <p className="p-16 text-center text-slate-500">Loading…</p>;
 const tabs=[['courses',`My Courses (${enrolled.length})`],['path','Learning Path'],['saved',`Saved (${saved.length})`]];
 return <main className="mx-auto max-w-4xl px-4 py-10"><h1 className="text-3xl font-extrabold text-slate-900">My Learning</h1>
 <section className="mt-6 grid gap-4 sm:grid-cols-4">{[['Enrolled',enrolled.length],['Completed',done],['Saved',saved.length],['Overall progress',avg+'%']].map(([a,b])=><div key={a} className="rounded-2xl bg-indigo-50 p-4"><p className="text-xs font-semibold text-indigo-700">{a}</p><p className="text-2xl font-extrabold text-slate-900">{b}</p></div>)}</section>
 <div className="mt-6 flex gap-2 border-b border-slate-200" role="tablist">{tabs.map(([k,l])=><button key={k} role="tab" aria-selected={tab===k} onClick={()=>setTab(k)} className={`px-4 py-2 text-sm font-semibold ${tab===k?'border-b-2 border-indigo-600 text-indigo-700':'text-slate-500'}`}>{l}</button>)}</div>
 {err&&<p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
 <div className="mt-6 space-y-4">
 {tab==='courses'&&(enrolled.length?enrolled.map(x=>{const c=x.courseId,d=x.status==='completed';return <article key={x._id} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
  <div className="flex items-start justify-between gap-3"><div><Link to={`/courses/${c._id}`} className="font-bold text-slate-900 hover:text-indigo-600">{c.name}</Link><p className="text-sm text-slate-500">{c.provider} · {c.duration}</p></div>
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${d?'bg-emerald-100 text-emerald-800':'bg-indigo-100 text-indigo-700'}`}>{d?'Completed':'In progress'}</span></div>
  <div className="mt-4"><Bar v={x.progress}/><p className="mt-1 text-sm text-slate-600">{x.progress}% complete</p></div>
  <div className="mt-4 flex flex-wrap gap-2">{!d&&<><button className={btn} onClick={()=>upd(c._id,{progress:Math.min(100,x.progress+10),status:x.progress+10>=100?'completed':'in-progress'})}>+10% progress</button>
  <button className={btn2} onClick={()=>upd(c._id,{status:'completed'})}><Check size={16}/>Mark completed</button></>}<button className={btn2} onClick={()=>rm(c._id)}>Remove</button></div></article>}):<Empty t="You haven't enrolled in any course yet." c="Browse courses"/>)}
 {tab==='path'&&(path.length?<ol className="space-y-3">{path.map((x,i)=>{const c=x.courseId,lab=x.status==='completed'?'Completed':x.status==='in-progress'?'In progress':x._id===nextId?'Recommended next':'Planned';
  return <li key={x._id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-600 font-bold text-white">{i+1}</span>
  <div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{c.name}</p><Bar v={x.progress}/></div>
  <span className="text-xs font-bold text-indigo-700">{lab}</span>{x.status==='recommended'&&<button className={btn2} onClick={()=>upd(c._id,{status:'in-progress'})}>Enroll</button>}<button aria-label="Remove" className="text-slate-400 hover:text-red-500" onClick={()=>rm(c._id)}>✕</button></li>})}</ol>:<Empty t="Your learning path is empty. Add courses to build it." c="Find courses"/>)}
 {tab==='saved'&&(saved.length?saved.map(s=>{const c=s.courseId,e=inPath[c._id];return <article key={s._id} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100"><Link to={`/courses/${c._id}`} className="font-bold text-slate-900 hover:text-indigo-600">{c.name}</Link>
  <p className="text-sm text-slate-500">{c.provider} · {c.difficulty} · {c.duration}</p><div className="mt-4 flex flex-wrap gap-2">
  {(!e||e.status==='recommended')&&<button className={btn} onClick={()=>upd(c._id,{status:'in-progress'})}>Enroll</button>}{!e&&<button className={btn2} onClick={()=>upd(c._id,{})}>Add to Learning Path</button>}
  {e&&e.status!=='recommended'&&<button className={btn2} onClick={()=>upd(c._id,{status:'completed'})}>Mark completed</button>}<button className={btn2} onClick={()=>unsave(c._id)}>Remove</button></div></article>}):<Empty t="No saved courses yet." c="Browse courses"/>)}
 </div></main>}
