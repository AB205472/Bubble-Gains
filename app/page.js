"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PROFILE, SEED_ENTRIES } from "../lib/seed";
import { calculateGame, todayTotals, missingCheckInQuestions } from "../lib/game";

const STORE = "bubble_v2_entries";
const SEEDED = "bubble_v2_seeded";

const BUBBLES = {
  body: { icon:"💪", name:"Body", color:"lavender", blurb:"Food, movement, weight, strength and health" },
  relationships: { icon:"❤️", name:"Relationships", color:"pink", blurb:"Justin, Nat, family, closeness and boundaries" },
  mind: { icon:"🧠", name:"Mind", color:"blue", blurb:"Mood, grief, confidence and nervous-system days" },
  work: { icon:"💼", name:"Work", color:"mint", blurb:"Accounting, payroll, burnout and career direction" },
  money: { icon:"💰", name:"Money", color:"gold", blurb:"Spending, budgets, income and freedom plans" },
  creativity: { icon:"🎨", name:"Creativity", color:"pink", blurb:"Art, ideas, style and things that feel like you" },
  fun: { icon:"🎮", name:"Fun", color:"blue", blurb:"RuneScape, trips, swimming and joy for no reason" },
  growth: { icon:"🌱", name:"Growth", color:"mint", blurb:"The person you are actively becoming" }
};

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}
function normalizeSeed(e, i) {
  return { id: `seed-${i}`, summary:"", encouragement:"", categories:["life"], data:{}, ...e };
}
function save(entries) {
  localStorage.setItem(STORE, JSON.stringify(entries));
}
function fmt(v, digits=0) {
  return Number(v || 0).toLocaleString(undefined,{maximumFractionDigits:digits});
}
function n(v){ return Number.isFinite(Number(v)) ? Number(v) : 0; }

function filteredEntries(entries, key) {
  return entries.filter(e => (e.categories || []).includes(key));
}

function bubbleSnapshot(entries, key) {
  const relevant = filteredEntries(entries, key);
  const totals = relevant.reduce((a,e)=>{
    const d=e.data||{};
    a.calories+=n(d.calories); a.protein+=n(d.protein_g); a.water+=n(d.water_oz);
    a.miles+=n(d.miles); a.squats+=n(d.squats); a.workout+=n(d.workout_minutes);
    a.sleep+=n(d.sleep_hours); if(d.sleep_hours!=null)a.sleepLogs++;
    a.spending+=n(d.spending); a.growth+=n(d.growth_points);
    if(d.mood)a.moods.push(d.mood);
    (d.people||[]).forEach(p=>a.people[p]=(a.people[p]||0)+1);
    return a;
  },{calories:0,protein:0,water:0,miles:0,squats:0,workout:0,sleep:0,sleepLogs:0,spending:0,growth:0,moods:[],people:{}});

  const recent = relevant.slice(0,3);
  const latest = recent[0];
  const people = Object.entries(totals.people).sort((a,b)=>b[1]-a[1]).map(([x])=>x).slice(0,3);
  const mood = totals.moods[0];

  const summaries = {
    body: relevant.length
      ? `You have been building consistency through small workday workouts, stronger gym sessions, walking, food honesty, and a gentler relationship with your body. You are not chasing perfection anymore—you are proving that you can keep showing up.`
      : `This Bubble will become the home for your food, movement, strength, sleep and body-image progress.`,
    relationships: relevant.length
      ? `Your relationship history shows a huge heart, strong loyalty, and a growing awareness that closeness should not require abandoning yourself. You are learning to love people without making your own needs disappear.`
      : `This Bubble will help you notice who feels safe, where you feel drained, and how your boundaries are growing.`,
    mind: relevant.length
      ? `You have been moving through grief, uncertainty, burnout and body-image shifts with more honesty than before. The pattern is not that you never struggle—the pattern is that you are getting better at hearing what the struggle is trying to tell you.`
      : `This Bubble will track mood, stress, confidence, grief and the things that help you come back to yourself.`,
    work: relevant.length
      ? `Work has asked far too much of your time and mental energy. At the same time, you have become clearer about the life you actually want: meaningful work, enough money, art, peace, health and room to care about people.`
      : `This Bubble will hold job stress, wins, projects, payroll chaos, career plans and your path toward freedom.`,
    money: relevant.length
      ? `You are starting to treat money as a tool for freedom rather than another source of shame. Every honest purchase, plan and goal makes this stat more useful.`
      : `This Bubble is ready for spending, income, bills, savings and freedom planning—without judgment.`,
    creativity: relevant.length
      ? `Your creativity grows whenever you choose what feels like you instead of what you think you are supposed to look like or produce.`
      : `This Bubble is waiting for your art, design ideas, outfits, writing and anything that makes your brain light up.`,
    fun: relevant.length
      ? `Fun is not wasted time. Swimming, games, trips and little moments of play are part of building a life you actually want to stay present for.`
      : `This Bubble is for RuneScape, trips, lakes, games, hobbies and joy that does not need to earn its place.`,
    growth: relevant.length
      ? `Your clearest growth is that you are beginning to choose values over fear, honesty over appearances, and peace over chasing. You are still soft—you are just becoming less willing to disappear.`
      : `This Bubble will collect the moments where you notice yourself changing.`
  };

  return { relevant, totals, recent, latest, people, mood, summary:summaries[key] };
}

export default function Home() {
  const [tab,setTab] = useState("home");
  const [activeBubble,setActiveBubble] = useState("body");
  const [entries,setEntries] = useState([]);
  const [text,setText] = useState("");
  const [bubbleText,setBubbleText] = useState("");
  const [loading,setLoading] = useState(false);
  const [notice,setNotice] = useState("");
  const [historyQuery,setHistoryQuery] = useState("");
  const [historyAnswer,setHistoryAnswer] = useState("");
  const [profileOpen,setProfileOpen] = useState(false);
  const [weight,setWeight] = useState("");
  const [avatarMood,setAvatarMood] = useState(0);
  const [activeStat,setActiveStat] = useState(null);
  const supabase = useMemo(()=>supabaseClient(),[]);

  const avatarMessages = [
    "you got this, bestie ♡",
    "drink some water, babe 🫧",
    "progress counts even when it's messy",
    "girl... log the sleep 😂",
    "you are doing better than you think"
  ];

  useEffect(()=>{
    const existing = JSON.parse(localStorage.getItem(STORE) || "[]");
    if (!localStorage.getItem(SEEDED)) {
      const seeded = [...SEED_ENTRIES.map(normalizeSeed), ...existing]
        .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
      save(seeded);
      localStorage.setItem(SEEDED,"1");
      setEntries(seeded);
    } else setEntries(existing);
  },[]);

  const game = useMemo(()=>calculateGame(entries),[entries]);
  const today = useMemo(()=>todayTotals(entries),[entries]);
  const checkQuestions = useMemo(()=>missingCheckInQuestions(entries),[entries]);
  const activeSnapshot = useMemo(()=>bubbleSnapshot(entries,activeBubble),[entries,activeBubble]);

  async function submitLog(extraText="", preferredCategory=null) {
    const content = (extraText || text).trim();
    if (!content || loading) return;
    setLoading(true); setNotice("");
    try {
      const res = await fetch("/api/parse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"log",text:content,profile:PROFILE,preferredCategory})});
      const parsed = await res.json();
      if (!res.ok) throw new Error(parsed.error || "Bubble had trouble reading that.");
      const categories = [...new Set([...(parsed.categories || ["life"]), ...(preferredCategory ? [preferredCategory] : [])])];
      const record = {
        id: crypto.randomUUID(),
        created_at:new Date().toISOString(),
        raw_text:content,
        summary:parsed.summary || content,
        encouragement:parsed.encouragement || "You checked in. That counts. 🫧",
        categories,
        data:parsed.data || {}
      };
      const next=[record,...entries];
      setEntries(next); save(next); setText(""); setBubbleText("");
      if (supabase) {
        const { error } = await supabase.from("bubbles").insert(record);
        if (error) setNotice("Saved privately on this device. Cloud sync needs attention.");
        else setNotice("Saved. Your stats just moved. ✨");
      } else setNotice("Saved privately on this device. ✨");
    } catch(err) { setNotice(err.message); }
    finally { setLoading(false); }
  }

  async function askHistory() {
    if (!historyQuery.trim()) return;
    setLoading(true); setHistoryAnswer("");
    try {
      const res=await fetch("/api/parse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"query",text:historyQuery,history:entries.slice(0,250),profile:PROFILE})});
      const data=await res.json();
      setHistoryAnswer(data.answer || data.error);
    } finally { setLoading(false); }
  }

  function answerQuestion(q) {
    setText(prev => prev ? `${prev}\n${q} ` : `${q} `);
    window.scrollTo({top:0,behavior:"smooth"});
    setTab("home");
  }

  function addWeight() {
    const v=Number(weight);
    if(!v) return;
    submitLog(`Current weight: ${v} pounds.`,"body");
    setWeight("");
    setProfileOpen(false);
  }

  function deleteEntry(id) {
    const next=entries.filter(e=>e.id!==id); setEntries(next); save(next);
  }

  function openBubble(key){
    setActiveBubble(key);
    setTab("bubble-detail");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  return (
    <main className="shell">
      <header className="header">
        <div className="brand">
          <span className="tiny">ALLI'S LIFE LEARNING BUBBLE</span>
          <h1>Bubble <span>🫧</span></h1>
          <p>Live your life. Bubble organizes it.</p>
        </div>
        <button className="profile-button" onClick={()=>setProfileOpen(!profileOpen)}>
          <div className="avatar-ring"><img src="/alli-avatar.svg" alt="Alli's Bubble avatar"/></div>
          <span><b>Level {game.level}</b><small>Brave Bubble</small></span>
        </button>
      </header>

      {profileOpen && <section className="profile-pop card">
        <div className="mini-profile-avatar" onClick={()=>setAvatarMood((avatarMood+1)%avatarMessages.length)}>
          <img src="/alli-avatar.svg" alt="Alli avatar"/>
          <span>{avatarMessages[avatarMood]}</span>
        </div>
        <div className="profile-details">
          <b>{PROFILE.name}, {PROFILE.age}</b><small>{PROFILE.height} · {PROFILE.weightNote}</small>
          <div className="weight-row"><input value={weight} onChange={e=>setWeight(e.target.value)} placeholder="New weight"/><button onClick={addWeight}>Update</button></div>
          <small>Tap the avatar. She talks now. 😂</small>
        </div>
      </section>}

      <nav className="nav">
        {["home","bubbles","history"].map(x=><button key={x} className={(tab===x || (x==="bubbles"&&tab==="bubble-detail"))?"active":""} onClick={()=>setTab(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}
      </nav>

      {tab==="home" && <>
        <section className="game-top card">
          <div className="avatar-stage interactive-avatar" onClick={()=>setAvatarMood((avatarMood+1)%avatarMessages.length)}>
            <div className="avatar-halo"></div>
            <img src="/alli-avatar.svg" alt="Alli avatar"/>
            <div className="speech">{avatarMessages[avatarMood]}</div>
            <div className="avatar-actions"><span>✨</span><span>🫧</span><span>💗</span></div>
          </div>
          <div className="level-panel">
            <p className="soft">YOUR CURRENT OVERVIEW</p>
            <h2>Level {game.level}</h2>
            <h3>{game.level<3?"Brave Bubble":game.level<6?"Strong Bubble":"Unstoppable Bubble"}</h3>
            <div className="xp-label"><span>XP</span><b>{game.levelXP} / 100</b></div>
            <div className="bar"><i style={{width:`${game.levelXP}%`}}/></div>
            <small>{game.nextLevelXP} XP to next level</small>
          </div>
        </section>

        <section className="stat-grid">
          <Stat name="Strength" icon="💪" value={game.stats.strength} desc="squats + resistance + workouts" onClick={()=>setActiveStat("strength")}/>
          <Stat name="Agility" icon="🪽" value={game.stats.agility} desc="walking + stairs + movement" onClick={()=>setActiveStat("agility")}/>
          <Stat name="Health" icon="🍓" value={game.stats.health} desc="fuel + hydration + consistency" onClick={()=>setActiveStat("health")}/>
          <Stat name="Sleep" icon="🌙" value={game.stats.sleep} desc="hours + sleep quality" onClick={()=>setActiveStat("sleep")}/>
          <Stat name="Resilience" icon="🛡️" value={game.stats.resilience} desc="showing up through hard things" onClick={()=>setActiveStat("resilience")}/>
          <Stat name="Wisdom" icon="🔮" value={game.stats.wisdom} desc="reflection + pattern recognition" onClick={()=>setActiveStat("wisdom")}/>
          <Stat name="Social" icon="💞" value={game.stats.social} desc="connection + honest boundaries" onClick={()=>setActiveStat("social")}/>
          <Stat name="Creativity" icon="🎨" value={game.stats.creativity} desc="art + play + self-expression" onClick={()=>setActiveStat("creativity")}/>
          <Stat name="Finance" icon="🪙" value={game.stats.finance} desc="money awareness + planning" onClick={()=>setActiveStat("finance")}/>
        </section>

        <section className="lifetime card">
          <h3>Lifetime adventure totals</h3>
          <div><span><b>{fmt(game.totals.miles,2)}</b><small>miles</small></span><span><b>{fmt(game.totals.squats)}</b><small>squats</small></span><span><b>{fmt(game.totals.workoutMinutes)}</b><small>workout min</small></span><span><b>{fmt(game.totals.checkins)}</b><small>memories</small></span></div>
        </section>

        <section className="hero card">
          <div className="hero-copy">
            <p className="soft">Good {new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening"}, Alli.</p>
            <h2>What happened today?</h2>
            <p>Food, workouts, sleep, feelings, money, work, relationships—talk normally. One update can move several stats.</p>
          </div>
          <textarea value={text} onChange={e=>setT
      <section className="game-top card">
          <div className="avatar-stage interactive-avatar" onClick={()=>setAvatarMood((avatarMood+1)%avatarMessages.length)}>
            <div className="avatar-halo"></div>
            <img src="/alli-avatar.svg" alt="Alli avatar"/>
            <div className="speech">{avatarMessages[avatarMood]}</div>
            <div className="avatar-actions"><span>✨</span><span>🫧</span><span>💗</span></div>
          </div>
          <div className="level-panel">
            <p className="soft">CURRENT CLASS</p>
            <h2>Level {game.level}</h2>
            <h3>{game.level<3?"Brave Bubble":game.level<6?"Strong Bubble":"Unstoppable Bubble"}</h3>
            <div className="xp-label"><span>XP</span><b>{game.levelXP} / 100</b></div>
            <div className="bar"><i style={{width:`${game.levelXP}%`}}/></div>
            <small>{game.nextLevelXP} XP to next level</small>
          </div>
        </section>

        <section className="stat-grid">
          <Stat name="Strength" icon="💪" value={game.stats.strength} desc="squats + resistance + workouts" onClick={()=>setActiveStat("strength")}/>
          <Stat name="Agility" icon="🪽" value={game.stats.agility} desc="walking + stairs + movement" onClick={()=>setActiveStat("agility")}/>
          <Stat name="Health" icon="🍓" value={game.stats.health} desc="fuel + hydration + consistency" onClick={()=>setActiveStat("health")}/>
          <Stat name="Sleep" icon="🌙" value={game.stats.sleep} desc="hours + sleep quality" onClick={()=>setActiveStat("sleep")}/>
          <Stat name="Resilience" icon="🛡️" value={game.stats.resilience} desc="showing up through hard things" onClick={()=>setActiveStat("resilience")}/>
          <Stat name="Wisdom" icon="🔮" value={game.stats.wisdom} desc="reflection + pattern recognition" onClick={()=>setActiveStat("wisdom")}/>
          <Stat name="Social" icon="💞" value={game.stats.social} desc="connection + honest boundaries" onClick={()=>setActiveStat("social")}/>
          <Stat name="Creativity" icon="🎨" value={game.stats.creativity} desc="art + play + self-expression" onClick={()=>setActiveStat("creativity")}/>
          <Stat name="Finance" icon="🪙" value={game.stats.finance} desc="money awareness + planning" onClick={()=>setActiveStat("finance")}/>
        </section>

        <section className="lifetime card">
          <h3>Lifetime adventure totals</h3>
          <div><span><b>{fmt(game.totals.miles,2)}</b><small>miles</small></span><span><b>{fmt(game.totals.squats)}</b><small>squats</small></span><span><b>{fmt(game.totals.workoutMinutes)}</b><small>workout min</small></span><span><b>{fmt(game.totals.checkins)}</b><small>memories</small></span></div>
        </section>
      </>}

      {tab==="bubbles" && <section>
        <div className="page-title"><p className="soft">ONE LIFE, DIFFERENT VIEWS</p><h2>Your Bubbles</h2><p>Click any Bubble to see its overview, stats, history, and add an update directly.</p></div>
        <div className="bubble-grid">
          {Object.entries(BUBBLES).map(([key,b])=><button className={`bubble-card ${b.color}`} key={key} onClick={()=>openBubble(key)}><span>{b.icon}</span><h3>{b.name}</h3><p>{b.blurb}</p><i>Open Bubble →</i></button>)}
        </div>
      </section>}

      {tab==="bubble-detail" && <BubbleDetail
        bubbleKey={activeBubble}
        bubble={BUBBLES[activeBubble]}
        snapshot={activeSnapshot}
        text={bubbleText}
        setText={setBubbleText}
        loading={loading}
        notice={notice}
        submit={()=>submitLog(bubbleText,activeBubble)}
        back={()=>setTab("bubbles")}
      />}

      {tab==="history" && <section>
        <div className="page-title"><p className="soft">BUBBLE REMEMBERS</p><h2>Your story so far</h2></div>
        <section className="ask card">
          <h3>Ask your history</h3>
          <div><input value={historyQuery} onChange={e=>setHistoryQuery(e.target.value)} placeholder="When did I start feeling more comfortable in my body?"/><button className="primary" onClick={askHistory}>Ask</button></div>
          {historyAnswer && <p>{historyAnswer}</p>}
        </section>
        <div className="timeline">
          {entries.map(e=><article className="entry card" key={e.id}>
            <div className="entry-head"><div>{(e.categories||["life"]).map(c=><span key={c}>{c}</span>)}</div><button onClick={()=>deleteEntry(e.id)}>×</button></div>
            <time>{new Date(e.created_at).toLocaleString([],{dateStyle:"medium",timeStyle:"short"})}</time>
            <h3>{e.summary || e.raw_text}</h3>
            <p>{e.raw_text}</p>
            {e.encouragement && <blockquote>{e.encouragement}</blockquote>}
          </article>)}
        </div>
      </section>}


      {activeStat && <StatDetail
        statKey={activeStat}
        value={game.stats[activeStat]}
        entries={entries}
        onClose={()=>setActiveStat(null)}
      />}

      <footer>Built with 🫧, stubbornness, and an entirely reasonable number of “ew”s.</footer>
    </main>
  );
}

function BubbleDetail({bubbleKey,bubble,snapshot,text,setText,loading,notice,submit,back}){
  const t=snapshot.totals;
  const stats = {
    body:[
      ["🚶‍♀️","Miles",fmt(t.miles,2)],["💪","Squats",fmt(t.squats)],["⏱️","Workout min",fmt(t.workout)],
      ["🥚","Protein logged",`${fmt(t.protein)}g`],["🌙","Avg sleep",t.sleepLogs?`${fmt(t.sleep/t.sleepLogs,1)} hr`:"—"]
    ],
    relationships:[
      ["💞","Relationship entries",snapshot.relevant.length],["👥","People tracked",snapshot.people.length],
      ["🌤️","Latest mood",snapshot.mood||"—"],["🛡️","Boundary growth",fmt(t.growth)]
    ],
    mind:[
      ["🧠","Mind check-ins",snapshot.relevant.length],["🌤️","Latest mood",snapshot.mood||"—"],
      ["🌱","Growth points",fmt(t.growth)],["🌙","Sleep logs",t.sleepLogs]
    ],
    work:[
      ["💼","Work check-ins",snapshot.relevant.length],["⚡","Latest stress",snapshot.latest?.data?.work_stress ?? "—"],
      ["🌱","Growth points",fmt(t.growth)]
    ],
    money:[
      ["💸","Spending logged",`$${fmt(t.spending,2)}`],["🪙","Money check-ins",snapshot.relevant.length]
    ],
    creativity:[
      ["🎨","Creative moments",snapshot.relevant.length],["🌱","Growth points",fmt(t.growth)]
    ],
    fun:[
      ["🎮","Fun moments",snapshot.relevant.length],["🚶‍♀️","Adventure miles",fmt(t.miles,2)]
    ],
    growth:[
      ["🌱","Growth entries",snapshot.relevant.length],["✨","Growth points",fmt(t.growth)],
      ["🛡️","Times you showed up",snapshot.relevant.length]
    ]
  }[bubbleKey] || [];

  return <section className="bubble-detail">
    <button className="back-button" onClick={back}>← All Bubbles</button>
    <section className={`bubble-overview card ${bubble.color}`}>
      <div className="overview-icon">{bubble.icon}</div>
      <div className="overview-copy">
        <p className="soft">CURRENT {bubble.name.toUpperCase()} OVERVIEW</p>
        <h2>{bubble.name} Bubble</h2>
        <p className="overview-summary">{snapshot.summary}</p>
        <p className="overview-motivation">{snapshot.latest?.encouragement || "Every honest update gives Bubble a clearer picture of how to support you."}</p>
      </div>
    </section>

    <section className="bubble-stat-row">
      {stats.map(([icon,label,value])=><Mini key={label} icon={icon} label={label} value={value}/>)}
    </section>

    <section className="bubble-update card">
      <div className="section-head"><div><p className="soft">UPDATE THIS BUBBLE</p><h3>What changed in {bubble.name.toLowerCase()}?</h3></div><span>{bubble.icon}</span></div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Tell Bubble anything about ${bubble.name.toLowerCase()}—no form, no organizing.`}/>
      <div className="send-row"><small>This update will always be saved inside the {bubble.name} Bubble, and can affect other stats too.</small><button className="primary" disabled={!text.trim()||loading} onClick={submit}>{loading?"Thinking...":"Update Bubble ✨"}</button></div>
      {notice && <div className="notice">{notice}</div>}
    </section>

    <section className="bubble-history">
      <div className="daily-title"><h3>Recent {bubble.name.toLowerCase()} history</h3><span>{snapshot.relevant.length} entries</span></div>
      {snapshot.recent.length ? snapshot.recent.map(e=><article className="entry card" key={e.id}><time>{new Date(e.created_at).toLocaleDateString([],{dateStyle:"medium"})}</time><h3>{e.summary}</h3><p>{e.raw_text}</p>{e.encouragement&&<blockquote>{e.encouragement}</blockquote>}</article>) : <div className="card empty">This Bubble is ready for its first real update. 🫧</div>}
    </section>
  </section>
}

function Mini({icon,label,value}){return <article className="mini card"><span>{icon}</span><small>{label}</small><b>{value}</b></article>}
function Quest({done,label,reward}){return <div className={`quest ${done?"done":""}`}><span>{done?"✓":"○"}</span><div><b>{label}</b><small>{reward}</small></div></div>}
function Stat({name,icon,value,desc,onClick}){return <button className="stat card stat-button" onClick={onClick}><div className="stat-head"><span>{icon}</span><div><b>{name}</b><small>{desc}</small></div><strong>{value}</strong></div><div className="bar"><i style={{width:`${value}%`}}/></div><em>See where this came from →</em></button>}

function statContributions(entries, key){
  const rows=[];
  entries.forEach(entry=>{
    const d=entry.data||{};
    const cats=entry.categories||[];
    let points=0;
    let reasons=[];
    if(key==="strength"){
      const repPoints=n(d.strength_reps)/35;
      const squatPoints=n(d.squats)/40;
      const workoutPoints=n(d.workout_minutes)/25;
      points=repPoints+squatPoints+workoutPoints;
      if(d.strength_reps)reasons.push(`${fmt(d.strength_reps)} strength reps`);
      if(d.squats)reasons.push(`${fmt(d.squats)} squats`);
      if(d.workout_minutes)reasons.push(`${fmt(d.workout_minutes)} workout minutes`);
    }
    if(key==="agility"){
      const milePoints=n(d.miles)*2.4;
      const stepPoints=n(d.steps)/2500;
      const flightPoints=n(d.flights)*.5;
      const movementPoints=(d.exercises||[]).filter(x=>/stairs|stair|side step|walking|treadmill|swim/i.test(x)).length;
      points=milePoints+stepPoints+flightPoints+movementPoints;
      if(d.miles)reasons.push(`${fmt(d.miles,2)} miles`);
      if(d.steps)reasons.push(`${fmt(d.steps)} steps`);
      if(d.flights)reasons.push(`${fmt(d.flights)} flights`);
      if(movementPoints)reasons.push(`${movementPoints} agility-type exercise${movementPoints===1?"":"s"}`);
    }
    if(key==="health"){
      const proteinPoints=Math.min(3,n(d.protein_g)/35);
      const producePoints=n(d.fruit_veg)*.7;
      const waterPoints=Math.min(2,n(d.water_oz)/40);
      points=proteinPoints+producePoints+waterPoints;
      if(d.protein_g)reasons.push(`${fmt(d.protein_g)}g protein`);
      if(d.fruit_veg)reasons.push(`${fmt(d.fruit_veg)} fruit/veg servings`);
      if(d.water_oz)reasons.push(`${fmt(d.water_oz)} oz water`);
    }
    if(key==="sleep"){
      if(d.sleep_hours!=null){
        points=Math.max(-1,(n(d.sleep_hours)-5)*.8);
        reasons.push(`${fmt(d.sleep_hours,1)} hours sleep`);
        if(d.sleep_quality)reasons.push(`quality ${d.sleep_quality}/5`);
      }
    }
    if(key==="resilience"){
      points=(cats.includes("growth")?2.4:0)+(cats.includes("mind")?1.1:0);
      if(cats.includes("growth"))reasons.push("growth entry");
      if(cats.includes("mind"))reasons.push("honest mind check-in");
    }
    if(key==="wisdom"){
      points=n(d.growth_points)/3+(cats.includes("growth")?1.2:0);
      if(d.growth_points)reasons.push(`${fmt(d.growth_points)} growth points`);
      if(cats.includes("growth"))reasons.push("reflection/pattern recognition");
    }
    if(key==="social"){
      points=cats.includes("relationships")?1.6:0;
      if(points)reasons.push("relationship entry or boundary reflection");
    }
    if(key==="creativity"){
      points=(cats.includes("creativity")||cats.includes("fun"))?1.2:0;
      if(points)reasons.push(cats.includes("creativity")?"creative entry":"play/fun entry");
    }
    if(key==="finance"){
      points=cats.includes("money")?1.4:0;
      if(points)reasons.push("money awareness entry");
    }
    if(Math.abs(points)>.001)rows.push({...entry,points,reasons});
  });
  return rows.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
}

function StatDetail({statKey,value,entries,onClose}){
  const config={
    strength:{name:"Strength",icon:"💪",base:8,explain:"Strength rises from resistance reps, squats, and workout minutes."},
    agility:{name:"Agility",icon:"🪽",base:8,explain:"Agility rises from miles, steps, stairs, walking, swimming, treadmill work, and similar movement."},
    health:{name:"Health",icon:"🍓",base:10,explain:"Health rises from protein, fruit and vegetables, hydration, and consistent logging."},
    sleep:{name:"Sleep",icon:"🌙",base:10,explain:"Sleep changes from hours logged. Seven or more hours helps it rise; very short nights can pull it down."},
    resilience:{name:"Resilience",icon:"🛡️",base:12,explain:"Resilience rises when you honestly log hard emotions and growth moments instead of disappearing from them."},
    wisdom:{name:"Wisdom",icon:"🔮",base:10,explain:"Wisdom rises from reflection, recognizing patterns, and meaningful growth entries."},
    social:{name:"Social",icon:"💞",base:10,explain:"Social rises from relationship check-ins, connection, honesty, and boundary work."},
    creativity:{name:"Creativity",icon:"🎨",base:8,explain:"Creativity rises through art, self-expression, hobbies, play, and fun."},
    finance:{name:"Finance",icon:"🪙",base:8,explain:"Finance rises whenever you log spending, income, planning, or money awareness."}
  }[statKey];
  const rows=statContributions(entries,statKey);
  const rawTotal=rows.reduce((a,r)=>a+r.points,0);
  return <div className="stat-modal-backdrop" onClick={onClose}>
    <section className="stat-modal card" onClick={e=>e.stopPropagation()}>
      <button className="stat-close" onClick={onClose}>×</button>
      <div className="stat-modal-title"><span>{config.icon}</span><div><p className="soft">STAT BREAKDOWN</p><h2>{config.name}: {value}</h2></div></div>
      <p className="stat-explain">{config.explain}</p>
      <div className="stat-equation"><span>Starting stat</span><b>{config.base}</b><span>+ logged progress</span><b>{rawTotal.toFixed(1)}</b><span>= displayed stat</span><b>{value}</b></div>
      <h3>Entries that contributed</h3>
      <div className="stat-sources">
        {rows.length ? rows.map(r=><article key={r.id}>
          <div><time>{new Date(r.created_at).toLocaleDateString([],{dateStyle:"medium"})}</time><b>+{r.points.toFixed(1)} raw points</b></div>
          <h4>{r.summary||r.raw_text}</h4>
          <p>{r.reasons.join(" · ")}</p>
        </article>) : <p className="empty-source">No logged entries have contributed yet. Your next honest update can move this stat.</p>}
      </div>
      <p className="stat-note">Stats are motivational game scores, not medical measurements. Bubble shows the source so nothing feels made up.</p>
    </section>
  </div>
}
