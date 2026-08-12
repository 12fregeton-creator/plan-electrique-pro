import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const KEY='plan-electrique-pro-project';
const presets={
'Prise 16A':{power:2300,protection:'16 A',section:'2,5 mm²'},
'Éclairage':{power:1000,protection:'10 A',section:'1,5 mm²'},
'Chauffe-eau':{power:2500,protection:'20 A',section:'2,5 mm²'},
'Four':{power:3500,protection:'20 A',section:'2,5 mm²'},
'Climatisation':{power:2500,protection:'20 A',section:'2,5 mm²'}
};
function calc(power){
 const a=power/230;
 if(a<=5){return ['10 A','1,5 mm²']}
 if(a<=16){return ['16 A','2,5 mm²']}
 if(a<=20){return ['20 A','2,5 mm²']}
 if(a<=25){return ['25 A','4 mm²']}
 if(a<=32){return ['32 A','6 mm²']}
 return ['40 A','10 mm²']
}
function App(){
 const [installPrompt,setInstallPrompt]=useState(null);
 const [circuits,setCircuits]=useState(()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}});
 const [selected,setSelected]=useState(null);
 const [name,setName]=useState('');
 const [power,setPower]=useState(1000);
 const [preset,setPreset]=useState('');
 const [panel,setPanel]=useState({main:'40 A',diff:'30 mA'});
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(circuits))},[circuits]);
 useEffect(()=>{
  const f=e=>{e.preventDefault();setInstallPrompt(e)}; const i=()=>setInstallPrompt(null);
  addEventListener('beforeinstallprompt',f);addEventListener('appinstalled',i);
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
  return()=>{removeEventListener('beforeinstallprompt',f);removeEventListener('appinstalled',i)}
 },[]);
 const total=useMemo(()=>circuits.reduce((s,c)=>s+Number(c.power||0),0),[circuits]);
 function add(){
  const p=Number(power)||0, [prot,sec]=calc(p);
  setCircuits(x=>[...x,{id:Date.now(),name:name||'Nouveau circuit',power:p,protection:prot,section:sec,rotation:0,x:50,y:50}]);
  setName('');setPreset('');
 }
 function applyPreset(v){setPreset(v);if(v){setName(v);setPower(presets[v].power)}}
 async function install(){if(installPrompt){await installPrompt.prompt();setInstallPrompt(null)}}
 return <div className="app">
  <header><div><h1>⚡ Plan Électrique Pro</h1><p>Conception · symboles · circuits · dimensionnement</p></div>
  {installPrompt&&<button className="primary" onClick={install}>⬇ Installer</button>}</header>
  <div className="toolbar">
   <button onClick={()=>setCircuits([])}>Nouveau</button><button onClick={()=>setCircuits([])}>Effacer les circuits</button>
   <span className="stat">{circuits.length} circuits · {total} W</span>
  </div>
  <section className="layout">
   <aside className="panel">
    <h2>Ajouter un circuit</h2>
    <label>Préréglage<select value={preset} onChange={e=>applyPreset(e.target.value)}><option value="">Choisir…</option>{Object.keys(presets).map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Nom<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. Chambre 1"/></label>
    <label>Puissance estimée (W)<input type="number" value={power} onChange={e=>setPower(e.target.value)}/></label>
    <button className="primary wide" onClick={add}>＋ Ajouter</button>
    <hr/>
    <h2>Tableau</h2>
    <label>Disjoncteur général<select value={panel.main} onChange={e=>setPanel({...panel,main:e.target.value})}>{['25 A','32 A','40 A','50 A','63 A'].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Différentiel<select value={panel.diff} onChange={e=>setPanel({...panel,diff:e.target.value})}>{['30 mA','300 mA'].map(x=><option key={x}>{x}</option>)}</select></label>
   </aside>
   <main className="canvas">
    <div className="canvasHead"><b>Plan / circuits</b><span>Appuyez sur un circuit pour le modifier</span></div>
    <div className="board">
      {circuits.length===0?<div className="empty">Aucun circuit.<br/>Ajoutez votre premier circuit à gauche.</div>:
      circuits.map((c,i)=><button key={c.id} className={'circuit '+(selected===c.id?'selected':'')} onClick={()=>setSelected(c.id)}>
       <b>{i+1}. {c.name}</b><span>{c.power} W · {c.protection} · {c.section}</span>
      </button>)}
    </div>
    {selected&&<div className="editor">{(()=>{const c=circuits.find(x=>x.id===selected);if(!c)return null;return <><b>Modifier : {c.name}</b><button onClick={()=>setCircuits(x=>x.filter(y=>y.id!==selected))}>Supprimer</button><button onClick={()=>setCircuits(x=>x.map(y=>y.id===selected?{...y,rotation:(y.rotation+90)%360}:y))}>↻ Rotation</button></>})()}</div>}
   </main>
  </section>
  <section className="analysis"><h2>Analyse automatique</h2><div className="cards">
   <div><small>Puissance totale</small><strong>{total.toLocaleString('fr-FR')} W</strong></div>
   <div><small>Courant estimé</small><strong>{(total/230).toFixed(1)} A</strong></div>
   <div><small>Circuits</small><strong>{circuits.length}</strong></div>
   <div><small>Protection générale</small><strong>{panel.main}</strong></div>
  </div><p className="warning">⚠️ Les sections et protections affichées sont des estimations. Elles doivent être vérifiées selon les normes applicables, le mode de pose, la longueur, la chute de tension et les caractéristiques réelles de l'installation.</p></section>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
  
