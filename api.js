export async function api(path,{method='GET',body}={}){
 const t=localStorage.getItem('token');
 const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:body?JSON.stringify(body):undefined})
  .catch(()=>{throw new Error('Cannot reach the server. Check that the backend is running on port 5000.')});
 const d=await r.json().catch(()=>({}));
 if(!r.ok){if(r.status===401&&t){localStorage.removeItem('token')}throw new Error(d.message||'Something went wrong. Please try again.')}
 return d}
