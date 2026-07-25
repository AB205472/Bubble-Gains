"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PROFILE, SEED_ENTRIES } from "../lib/seed";
import { calculateGame, todayTotals, missingCheckInQuestions } from "../lib/game";

const STORE = "bubble_v2_entries";
const SEEDED = "bubble_v2_seeded";

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

export default function Home() {
  const [tab,setTab] = useState("home");
  const [entries,setEntries] = useState([]);
  const [text,setText] = useState("");
  const [loading,setLoading] = useState(false);
  const [notice,setNotice] = useState("");
  const [historyQuery,setHistoryQuery] = useState("");
  const [historyAnswer,setHistoryAnswer] = useState("");
  const [profileOpen,setProfileOpen] = useState(false);
  const [weight,setWeight] = useState("");
  const supabase = useMemo(()=>supabaseClient(),[]);

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

  async function submitLog(extraText="") {
    const content = (extraText || text).trim();
    if (!content || loading) return;
    setLoading(true); setNotice("");
    try {
      const res = await fetch("/api/parse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"log",text:content,profile:PROFILE})});
      const parsed = await res.json();
      if (!res.ok) throw new Error(parsed.error || "Bubble had trouble reading that.");
      const record = {
        id: crypto.randomUUID(),
        created_at:new Date().toISOString(),
        raw_text:content,
        summary:parsed.summary || content,
        encouragement:parsed.encouragement || "You checked in. That counts. 🫧",
        categories:parsed.categories || ["life"],
        data:parsed.data || {}
      };
      const next=[record,...entries];
      setEntries(next); save(next); setText("");
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
    submitLog(`Current weight: ${v} pounds.`);
    setWeight("");
    setProfileOpen(false);
  }

  function deleteEntry(id) {
    const next=entries.filter(e=>e.id!==id); setEntries(next); save(next);
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
          <img src="/alli-avatar.svg" alt="Alli's Bubble avatar"/>
          <span><b>Level {game.level}</b><small>Brave Bubble</small></span>
        </button>
      </header>

      {profileOpen && <section className="profile-pop card">
        <div><b>{PROFILE.name}, {PROFILE.age}</b><small>{PROFILE.height} · {PROFILE.weightNote}</small></div>
        <div className="weight-row"><input value={weight} onChange={e=>setWeight(e.target.value)} placeholder="New weight"/><button onClick={addWeight}>Update</button></div>
      </section>}

      <nav className="nav">
        {["home","game","bubbles","history"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x==="game"?"Stats":x[0].toUpperCase()+x.slice(1)}</button>)}
      </nav>

      {tab==="home" && <>
        <section className="hero card">
          <div className="hero-copy">
            <p className="soft">Good {new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening"}, Alli.</p>
            <h2>What happened today?</h2>
            <p>Food, workouts, sleep, feelings, money, work, relationships—talk normally. One update can move several stats.</p>
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="I slept about 5 hours, had green tea, walked a mile, did 100 squats, and emotionally... girl."/>
          <div className="send-row">
            <small>Mistakes are data. You never have to perform for Bubble.</small>
            <button className="primary" onClick={()=>submitLog()} disabled={!text.trim()||loading}>{loading?"Thinking...":"Add update ✨"}</button>
          </div>
          {notice && <div className="notice">{notice}</div>}
        </section>

        <section className="daily-title"><h3>Today's totals</h3><span>{today.entries} check-in{today.entries===1?"":"s"}</span></section>
        <section className="today-grid">
          <Mini icon="🔥" label="Calories" value={today.calories?`~${fmt(today.calories)}`:"—"}/>
          <Mini icon="🥚" label="Protein" value={today.protein?`${fmt(today.protein)}g`:"—"}/>
          <Mini icon="🚶‍♀️" label="Miles walked" value={today.miles?fmt(today.miles,2):"—"}/>
          <Mini icon="💪" label="Squats" value={today.squats?fmt(today.squats):"—"}/>
          <Mini icon="💧" label="Water" value={today.water?`${fmt(today.water)} oz`:"—"}/>
          <Mini icon="🌙" label="Sleep" value={today.sleep?`${fmt(today.sleep,1)} hr`:"—"}/>
        </section>

        <section className="checkin card">
          <div className="section-head"><div><p className="soft">STAT CHECK</p><h3>Bubble is missing a few things</h3></div><span className="pulse">?</span></div>
          {checkQuestions.length ? checkQuestions.map(q=><button key={q} onClick={()=>answerQuestion(q)}>{q}<span>Answer →</span></button>) :
          <p className="complete">Everything important is updated for today. Tiny victory. ✨</p>}
        </section>

        <section className="quests card">
          <div className="section-head"><div><p className="soft">DAILY QUESTS</p><h3>Today's little missions</h3></div><span>🎀</span></div>
          <Quest done={today.miles>=1} label="Walk at least one mile" reward="+8 agility XP"/>
          <Quest done={today.squats>=60} label="Complete 60 squats" reward="+8 strength XP"/>
          <Quest done={today.protein>=80} label="Reach 80g protein" reward="+6 health XP"/>
          <Quest done={today.water>=64} label="Drink 64 oz water" reward="+6 health XP"/>
          <Quest done={today.sleep>=7} label="Log 7+ hours of sleep" reward="+8 sleep XP"/>
        </section>
      </>}

      {tab==="game" && <>
        <section className="game-top card">
          <div className="avatar-stage">
            <img src="/alli-avatar.svg" alt="Alli avatar"/>
            <div className="speech">you got this,<br/><b>bestie ♡</b></div>
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
          <Stat name="Strength" icon="💪" value={game.stats.strength} desc="squats + resistance + workouts"/>
          <Stat name="Agility" icon="🪽" value={game.stats.agility} desc="walking + stairs + movement"/>
          <Stat name="Health" icon="🍓" value={game.stats.health} desc="fuel + hydration + consistency"/>
          <Stat name="Sleep" icon="🌙" value={game.stats.sleep} desc="hours + sleep quality"/>
          <Stat name="Resilience" icon="🛡️" value={game.stats.resilience} desc="showing up through hard things"/>
          <Stat name="Wisdom" icon="🔮" value={game.stats.wisdom} desc="reflection + pattern recognition"/>
          <Stat name="Social" icon="💞" value={game.stats.social} desc="connection + honest boundaries"/>
          <Stat name="Creativity" icon="🎨" value={game.stats.creativity} desc="art + play + self-expression"/>
          <Stat name="Finance" icon="🪙" value={game.stats.finance} desc="money awareness + planning"/>
        </section>

        <section className="lifetime card">
          <h3>Lifetime adventure totals</h3>
          <div><span><b>{fmt(game.totals.miles,2)}</b><small>miles</small></span><span><b>{fmt(game.totals.squats)}</b><small>squats</small></span><span><b>{fmt(game.totals.workoutMinutes)}</b><small>workout min</small></span><span><b>{fmt(game.totals.checkins)}</b><small>memories</small></span></div>
        </section>
      </>}

      {tab==="bubbles" && <section>
        <div className="page-title"><p className="soft">ONE LIFE, DIFFERENT VIEWS</p><h2>Your Bubbles</h2></div>
        <div className="bubble-grid">
          {[
            ["💪","Body","Food, movement, weight, strength and health"],
            ["❤️","Relationships","Justin, Nat, family, closeness and boundaries"],
            ["🧠","Mind","Mood, grief, confidence and nervous-system days"],
            ["💼","Work","Accounting, payroll, burnout and career direction"],
            ["💰","Money","Spending, budgets, income and freedom plans"],
            ["🎨","Creativity","Art, ideas, personal style and things that feel like you"],
            ["🎮","Fun","RuneScape, trips, swimming and joy for no reason"],
            ["🌱","Growth","The person you are actively becoming"]
          ].map(([i,n,d])=><article className="bubble-card" key={n}><span>{i}</span><h3>{n}</h3><p>{d}</p></article>)}
        </div>
      </section>}

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

      <footer>Built with 🫧, stubbornness, and an entirely reasonable number of “ew”s.</footer>
    </main>
  );
}

function Mini({icon,label,value}){return <article className="mini card"><span>{icon}</span><small>{label}</small><b>{value}</b></article>}
function Quest({done,label,reward}){return <div className={`quest ${done?"done":""}`}><span>{done?"✓":"○"}</span><div><b>{label}</b><small>{reward}</small></div></div>}
function Stat({name,icon,value,desc}){return <article className="stat card"><div className="stat-head"><span>{icon}</span><div><b>{name}</b><small>{desc}</small></div><strong>{value}</strong></div><div className="bar"><i style={{width:`${value}%`}}/></div></article>}
