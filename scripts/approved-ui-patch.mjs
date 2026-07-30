import fs from 'node:fs';
const path='app/page.js';
let s=fs.readFileSync(path,'utf8');
const must=(pattern,replacement,label)=>{const next=s.replace(pattern,replacement);if(next===s)throw new Error('Missing patch target: '+label);s=next};

must(/const \[tab,setTab\]\s*=\s*useState\("chat"\);/,'const [tab,setTab] = useState("today");','initial tab');
s=s.replaceAll('setTab("chat")','setTab("today")');
s=s.replaceAll('setTab("home")','setTab("stats")');

must('squats: health.squats ?? null,','squats: health.squats ?? health.weighted_squats ?? null,','weighted squats mapping');
must('nutrition_confidence: row.nutrition?.confidence ?? null,','nutrition_confidence: row.nutrition?.confidence ?? null,\n      confirmed_minimum_calories: row.nutrition?.confirmed_minimum_calories ?? null,\n      confirmed_minimum_protein_g: row.nutrition?.confirmed_minimum_protein_g ?? null,\n      squat_weight_lb: health.squat_weight_lb ?? null,','verified minimum mapping');

must(/\{\["chat","home","bubbles","memories","history"\]\.map\(x=><button key=\{x\} className=\{\(tab===x \|\| \(x==="bubbles"&&tab==="bubble-detail"\)\)\?"active":""\} onClick=\{\(\)=>setTab\(x\)\}>\{x\[0\]\.toUpperCase\(\)\+x\.slice\(1\)\}<\/button>\)\}/,'{[{key:"today",label:"Today",icon:"bubble"},{key:"stats",label:"Overall",icon:"strength"},{key:"bubbles",label:"Insights",icon:"flower"},{key:"memories",label:"Memories",icon:"memories"},{key:"history",label:"History",icon:"history"}].map(item=><button key={item.key} className={(tab===item.key || (item.key==="bubbles"&&tab==="bubble-detail"))?"active":""} onClick={()=>setTab(item.key)}><BubbleIcon name={item.icon} size={21}/><span>{item.label}</span></button>)}','navigation');

must('{tab==="chat" && <DailyBubbleChat','{tab==="today" && <><DailyBubbleChat','today chat');
must(/openHome=\{\(\)=>setTab\("stats"\)\}\s*\/>/,'openHome={()=>document.getElementById("today-stats")?.scrollIntoView({behavior:"smooth"})}\n      /><TodaySnapshot today={today} entries={entries} profile={PROFILE}/></>','today snapshot mount');
must('{tab==="home" && <>','{tab==="stats" && <>','overall stats tab');
must('<section className="home-columns">','<section className="home-columns overall-stats-only">','overall stats columns');

s=s.replaceAll('<span>🫧</span>','<span><BubbleIcon name="bubble" size={22}/></span>');
s=s.replaceAll('<span>📍 Arkansas · Central Time</span>','<span><BubbleIcon name="flower" size={16}/> Arkansas · Central Time</span>');
s=s.replaceAll('Add update ✨','Add update');
s=s.replaceAll('Tiny victory. ✨','Tiny victory.');
s=s.replaceAll('Signed in. Your private Bubble history is now in the cloud. 🫧','Signed in. Your private Bubble history is now in the cloud.');
s=s.replaceAll('Pivotal Day 🫧','Pivotal Day');
s=s.replaceAll('Daily Story finalized. 🫧','Daily Story finalized.');
s=s.replaceAll('girl.','today.');

const marker='function DailyBubbleChat({';
const component=`function TodaySnapshot({today,entries,profile}){
  const todayEntry=entries.find(entry=>entry.data?.entry_date===centralDateKey()) || {};
  const data=todayEntry.data || {};
  const foods=Array.isArray(data.foods)?data.foods:[];
  const calories=today.calories?\`~\${Math.round(today.calories)}\`:data.confirmed_minimum_calories?\`\${Math.round(data.confirmed_minimum_calories)}+ confirmed\`:"Not totaled";
  const protein=today.protein?\`\${Math.round(today.protein)}g\`:data.confirmed_minimum_protein_g?\`\${Math.round(data.confirmed_minimum_protein_g)}g+ confirmed\`:"Not totaled";
  return <section id="today-stats" className="today-snapshot card">
    <div className="storybook-heading"><div><p className="soft">BUBBLE'S LIVE SNAPSHOT</p><h2>Confirmed so far today</h2></div><span className="live-pill">LIVE</span></div>
    <div className="verified-ledger">
      {foods.length?foods.map(food=><div className="ledger-line" key={food}><BubbleIcon name="health" size={18}/><span>{food}</span></div>):<p>No food entries confirmed yet.</p>}
      {today.water?<div className="ledger-line"><BubbleIcon name="health" size={18}/><span>{Math.round(today.water)} oz water</span></div>:null}
      {today.squats?<div className="ledger-line"><BubbleIcon name="strength" size={18}/><span>{Math.round(today.squats)} weighted squats{data.squat_weight_lb?\` with \${data.squat_weight_lb} lb\`:""}</span></div>:null}
    </div>
    <div className="approved-metric-pair">
      <div><BubbleIcon name="health" size={25}/><span><b>{calories}</b><small>calories</small></span></div>
      <div><BubbleIcon name="strength" size={25}/><span><b>{protein}</b><small>protein</small></span></div>
    </div>
    <div className="data-trust-note"><BubbleIcon name="wisdom" size={20}/><span><b>No guessing.</b><small>Unknown portions stay unknown until you confirm them.</small></span></div>
    <div className="protein-ribbon"><BubbleIcon name="heart" size={22}/><span><b>Protein goal: {profile.proteinGoalGrams}g</b><small>Bubble will only count amounts tied to a verified label or quantity.</small></span></div>
  </section>
}

`;
if(!s.includes('function TodaySnapshot(')) s=s.replace(marker,component+marker);
fs.writeFileSync(path,s);
