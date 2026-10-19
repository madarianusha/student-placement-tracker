const BASE=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export async function request(path,options={}){const r=await fetch(BASE+path,{headers:{'Content-Type':'application/json'},...options});if(!r.ok)throw new Error(`Request failed (${r.status})`);return r.status===204?null:r.json()}
export const applicationsAPI={list:()=>request('/applications'),create:(x)=>request('/applications',{method:'POST',body:JSON.stringify(x)}),update:(id,x)=>request(`/applications/${id}`,{method:'PUT',body:JSON.stringify(x)}),remove:(id)=>request(`/applications/${id}`,{method:'DELETE'})};
