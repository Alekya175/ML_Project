import {useState} from 'react';import {Link,useNavigate} from 'react-router-dom';import {useAuth} from '../context/AuthContext';import {Field,inp,btn,btn2,DEPTS} from '../components/ui';
export default function Auth({mode}){const reg=mode==='register',{login,register}=useAuth(),nav=useNavigate();
 const[f,setF]=useState({name:'',email:'',password:'',confirm:'',department:DEPTS[0],year:1}),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
 const set=k=>e=>setF({...f,[k]:e.target.value});
 const go=async fn=>{setErr('');setBusy(true);try{const u=await fn();nav(u.profileComplete?'/recommendations':'/profile-setup')}catch(e){setErr(e.message)}setBusy(false)};
 const submit=e=>{e.preventDefault();if(reg){if(f.password!==f.confirm)return setErr('Passwords do not match.');return go(()=>register({...f,year:+f.year}))}go(()=>login(f.email,f.password))};
 return <main className="grid min-h-[80vh] place-items-center bg-gradient-to-br from-indigo-50 to-violet-100 px-4 py-10"><div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
 <h1 className="text-2xl font-extrabold text-slate-900">{reg?'Create your account':'Welcome back'}</h1>
 <p className="mt-1 text-sm text-slate-500">{reg?'Start getting courses picked for you.':'Log in to see your recommendations.'}</p>
 <form onSubmit={submit} className="mt-6 space-y-4">
  {reg&&<Field label="Full name"><input required className={inp} value={f.name} onChange={set('name')}/></Field>}
  <Field label="Email"><input required type="email" className={inp} value={f.email} onChange={set('email')}/></Field>
  <Field label="Password"><input required type="password" minLength={6} className={inp} value={f.password} onChange={set('password')}/></Field>
  {reg&&<><Field label="Confirm password"><input required type="password" className={inp} value={f.confirm} onChange={set('confirm')}/></Field>
  <Field label="Department"><select className={inp} value={f.department} onChange={set('department')}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></Field>
  <Field label="Year of study"><select className={inp} value={f.year} onChange={set('year')}>{[1,2,3,4,5].map(y=><option key={y}>{y}</option>)}</select></Field></>}
  {err&&<p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
  <button disabled={busy} className={btn+' w-full'}>{busy?'Please wait…':reg?'Create account':'Log in'}</button></form>
 {!reg&&<button disabled={busy} onClick={()=>go(()=>login('demo@coursemate.ai','password123'))} className={btn2+' mt-3 w-full'}>Try the demo student</button>}
 <p className="mt-5 text-center text-sm text-slate-500">{reg?'Already have an account?':'New here?'} <Link className="font-semibold text-indigo-600" to={reg?'/login':'/register'}>{reg?'Log in':'Create an account'}</Link></p></div></main>}
