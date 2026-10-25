import {useEffect,useState} from 'react';import {Link} from 'react-router-dom';import {Check} from 'lucide-react';import CourseActions from '../components/CourseActions';import {useLearning} from '../services/useLearning';
import {api} from '../services/api';import {useAuth} from '../context/AuthContext';import {Ring,btn,btn2} from '../components/ui';
export default function Recommendations(){const{user}=useAuth(),[items,setItems]=useState([]),[meta,setMeta]=useState(null),[load,setLoad]=useState(true),[err,setErr]=useState(''),L=useLearning(),[busy,setBusy]=useState(false);
 const fetchAll=async()=>{try{setItems(await api('/recommendations'))}catch(e){setErr(e.message)}setLoad(false)};
 useEffect(()=>{fetchAll()},[]);
 const generate=async()=>{setBusy(true);setErr('');try{const r=await api('/recommendations/generate',{method:'POST',body:{text:user.learningText||''}});setMeta(r);await fetchAll()}catch(e){setErr(e.message)}setBusy(false)};
 const top=items.slice(0,5),compat=top.length?Math.round(top.reduce((a,x)=>a+x.finalScore,0)/top.length):0;
 if(load)return <p className="p-16 text-center text-slate-500">Loading your recommendations…</p>;
 return <main className="mx-auto max-w-6xl px-4 py-10">
 <h1 className="text-3xl font-extrabold text-slate-900">{items.length?'Your Personalized Recommendations Are Ready!':'My Recommendations'}</h1>
 <p className="mt-2 text-slate-600">Hi, {user.name.split(' ')[0]}! Here are courses selected for your profile.</p>
 {err&&<p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
 {!items.length?<div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
  <p className="font-semibold text-slate-800">{user.profileComplete?'No recommendations yet.':'Complete your profile to receive more accurate recommendations.'}</p>
  <div className="mt-5 flex justify-center gap-3">{!user.profileComplete&&<Link to="/profile-setup" className={btn}>Complete Profile</Link>}
  <button disabled={busy} onClick={generate} className={user.profileComplete?btn:btn2}>{busy?'Analyzing…':'Generate Recommendations'}</button></div></div>:<>
  <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[['Profile compatibility',compat+'%'],['Skills',(user.skills||[]).join(', ')||'—'],['Interests',(user.interests||[]).join(', ')||'—'],['Domain / level',`${(user.preferredDomains||[]).join(', ')||'—'} · ${user.learningLevel}`],['Courses analyzed',meta?meta.coursesAnalyzed:'All available']].map(([a,b])=>
   <div key={a} className="rounded-2xl bg-indigo-50 p-4"><p className="text-xs font-semibold text-indigo-700">{a}</p><p className="mt-1 text-sm font-bold text-slate-900">{b}</p></div>)}</section>
  <div className="mt-8 flex items-center justify-between"><h2 className="text-xl font-bold">Recommended for You</h2><div className="flex gap-2"><Link to="/profile-setup" className={btn2}>Update my answers</Link><button disabled={busy} onClick={generate} className={btn2}>{busy?'Analyzing…':'Regenerate'}</button></div></div>
  <div className="mt-4 grid gap-6 md:grid-cols-2">{items.filter(x=>x.courseId).map(x=>{const c=x.courseId,m=x.matched||{};return <article key={x._id} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
   <div className="flex items-start gap-4"><Ring v={x.finalScore}/><div><h3 className="font-bold text-slate-900">{c.name}</h3><p className="text-sm text-slate-500">{c.provider} · {c.difficulty} · {c.duration} · {c.rating} ★</p></div></div>
   <p className="mt-3 text-sm text-slate-600"><b>Category:</b> {c.category} <b className="ml-2">Skills:</b> {c.skillsRequired.join(', ')}</p>
   <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-800">Why this course is recommended</p><p className="mt-1 text-sm text-slate-600">{x.reason}</p>
    <ul className="mt-2 space-y-1 text-sm text-slate-700">{[...(m.skills||[]).map(s=>s+' matched'),...(m.interests||[]).map(s=>s+' interest matched'),...(m.wanted||[]).map(s=>s+' is on your wish list'),...(m.levelMatched?[c.difficulty+' level matched']:[])].map(t=><li key={t} className="flex items-center gap-2"><Check size={14} className="text-emerald-500"/>{t}</li>)}</ul></div>
   <CourseActions c={c} L={L}/></article>})}</div>
  <p className="mt-8 text-center text-xs text-slate-500">Match % is a relevance estimate based on profile similarity, not a measured accuracy.</p></>}</main>}
