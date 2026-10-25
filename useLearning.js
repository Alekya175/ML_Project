import {useEffect,useState} from 'react';import {api} from './api';
export function useLearning(){const[path,setPath]=useState({}),[saved,setSaved]=useState({}),[err,setErr]=useState('');
 useEffect(()=>{Promise.all([api('/learning-path'),api('/saved-courses')]).then(([p,s])=>{setPath(Object.fromEntries(p.filter(x=>x.courseId).map(x=>[x.courseId._id,x])));setSaved(Object.fromEntries(s.filter(x=>x.courseId).map(x=>[x.courseId._id,1])))}).catch(e=>setErr(e.message))},[]);
 const set=async(id,body)=>{try{const d=await api('/learning-path',{method:'POST',body:{courseId:id,...body}});setPath(p=>({...p,[id]:d}))}catch(e){setErr(e.message)}};
 const toggleSave=async id=>{try{await api(`/courses/${id}/save`,{method:saved[id]?'DELETE':'POST'});setSaved(s=>({...s,[id]:s[id]?0:1}))}catch(e){setErr(e.message)}};
 return{path,saved,err,toggleSave,enroll:id=>set(id,{status:'in-progress'}),plan:id=>set(id,{})}}
