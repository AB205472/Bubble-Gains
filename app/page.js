"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase";
import { PROFILE, SEED_ENTRIES } from "../lib/seed";
import { calculateGame, todayTotals, missingCheckInQuestions, BUBBLE_TIME_ZONE, centralDateKey, getStatContribution } from "../lib/game";

const STORE = "bubble_v2_entries";
const SEEDED = "bubble_v26_seeded";

const BUBBLES = {
  body: { icon:"body", name:"Body", color:"lavender", blurb:"Food, movement, weight, strength and health" },
  relationships: { icon:"relationships", name:"Relationships", color:"pink", blurb:"Justin, Nat, family, closeness and boundaries" },
  mind: { icon:"mind", name:"Mind", color:"blue", blurb:"Mood, grief, confidence and nervous-system days" },
  work: { icon:"work", name:"Work", color:"mint", blurb:"Accounting, payroll, burnout and career direction" },
  money: { icon:"money", name:"Money", color:"gold", blurb:"Spending, budgets, income and freedom plans" },
  creativity: { icon:"creativity", name:"Creativity", color:"pink", blurb:"Art, ideas, style and things that feel like you" },
  fun: { icon:"fun", name:"Fun", color:"blue", blurb:"RuneScape, trips, swimming and joy for no reason" },
  growth: { icon:"growth", name:"Growth", color:"mint", blurb:"The person you are actively becoming" }
};


const ICONS = {
  bubble: ["M12 3.5c-4.7 0-8.5 3.5-8.5 7.8 0 2.6 1.4 4.9 3.7 6.3l-.7 3 3.1-1.7c.8.2 1.6.3 2.4.3 4.7 0 8.5-3.5 8.5-7.9S16.7 3.5 12 3.5Z","M8.4 9.1h.1M15.5 8.2h.1M12 13.8c1.3 0 2.4-.6 3.1-1.5"],
  strength: ["M7.5 10.5v3M16.5 10.5v3M5 9.5v5M19 9.5v5M9 12h6","M8 7.5c.3-2 1.7-3.2 4-3.2s3.7 1.2 4 3.2"],
  agility: ["M4 15.5c3.3-1.4 5.6-4 7.2-8 1.6 2 2.2 4.2 1.8 6.5 2.5-.5 4.6-1.7 6.5-3.6-1 5.2-4 8.2-9 8.2-2.6 0-4.8-1-6.5-3.1Z","M8.5 17.5 6.7 20M14.5 17.4l1.9 2.6"],
  health: ["M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z","M9.5 11.5h5M12 9v5"],
  sleep: ["M17.8 16.5A7.5 7.5 0 0 1 8 6.2a7 7 0 1 0 9.8 10.3Z","M16 5l.7 1.5L18 7l-1.3.5L16 9l-.6-1.5L14 7l1.4-.5L16 5Z"],
  resilience: ["M12 3.5 19 7v5.2c0 4-2.8 6.9-7 8.3-4.2-1.4-7-4.3-7-8.3V7l7-3.5Z","m9.2 12 1.8 1.8 4-4"],
  wisdom: ["M9 18h6M9.5 21h5","M8.2 14.8C6.8 13.7 6 12 6 10a6 6 0 1 1 12 0c0 2-.8 3.7-2.2 4.8-.8.7-1.2 1.4-1.3 2.2h-5c-.1-.8-.5-1.5-1.3-2.2Z","M12 3.5v2M4.8 6.1l1.5 1M19.2 6.1l-1.5 1"],
  social: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM15.8 10.3a2.8 2.8 0 1 0 0-5.6","M3.5 20v-2.2c0-3.1 2.4-5.3 5.5-5.3s5.5 2.2 5.5 5.3V20M14.5 13.3c3.2-.2 5.7 1.6 6 4.7v2"],
  creativity: ["M5 19c3.4-4.8 6.6-8 11.8-12.8l2 2C14 13.3 10.8 16.4 6 20l-1-1Z","M14.8 8.1l2.8 2.8M4 20l3-.8-2.2-2.2L4 20Z","M18.5 3.5l.5 1.1 1.2.4-1.2.5-.5 1.1-.5-1.1-1.2-.5 1.2-.4.5-1.1Z"],
  finance: ["M4 7.5h16v11H4z","M7 7.5V5h10v2.5M8 13h8M12 10v6"],
  body: ["M9 7.5a3 3 0 1 1 6 0v2.2c0 .9.4 1.8 1.1 2.4 1.5 1.2 2.4 3 2.4 5v2.4h-13v-2.4c0-2 .9-3.8 2.4-5A3.1 3.1 0 0 0 9 9.7V7.5Z"],
  relationships: ["M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z"],
  mind: ["M9.2 19.5H8a4 4 0 0 1-4-4c0-1.4.7-2.7 1.8-3.4A4.5 4.5 0 0 1 9.5 5c.9-1.4 2.5-2.3 4.3-2.3A5.2 5.2 0 0 1 19 8v.5a4.8 4.8 0 0 1 1 8.8","M9 8.5c1.7.3 2.8 1.3 3 3M12 11.5c1.9-.2 3.2.6 4 2.2M9.2 19.5V15h5.3v4.5"],
  work: ["M4 8h16v11H4z","M9 8V5h6v3M4 12.5h16M10 12.5v1h4v-1"],
  money: ["M12 3.5v17M16 7c-.7-1.4-2-2-4-2-2.2 0-3.5 1-3.5 2.6 0 1.7 1.2 2.5 3.8 3.1 2.5.6 3.7 1.4 3.7 3.2 0 1.8-1.5 3.1-4 3.1-2.1 0-3.7-.8-4.5-2.4"],
  fun: ["M7 9h10l2.5 7.5a2 2 0 0 1-3.2 2.1L14 16h-4l-2.3 2.6a2 2 0 0 1-3.2-2.1L7 9Z","M9 12v3M7.5 13.5h3M15.5 12.8h.1M17.2 14.5h.1"],
  growth: ["M12 20v-8M12 14c-3.8 0-6-2-6-5.5 3.7 0 6 2 6 5.5ZM12 11c3.8 0 6-2 6-5.5-3.7 0-6 2-6 5.5Z"],
  memories: ["M5 5.5h14v14H5z","M8 9h8M8 12h8M8 15h5"],
  history: ["M12 7v5l3 2","M4.5 8A8 8 0 1 1 4 15M4 4v4h4"],
  milestone: ["M12 3.5 14.2 8l4.8.7-3.5 3.4.8 4.8L12 14.6 7.7 17l.8-4.8L5 8.7 9.8 8 12 3.5Z"],
  achievement: ["M8 4.5h8v5a4 4 0 0 1-8 0v-5Z","M8 6H5v1.5A3.5 3.5 0 0 0 8.5 11M16 6h3v1.5A3.5 3.5 0 0 1 15.5 11M12 13.5V18M9 20h6"],
  flower: ["M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z","M12 9.5c-3.5-1-4.4-4.3-2-5.5 2 1 2.4 3.2 1.6 5.5M14 10c1-3.5 4.3-4.4 5.5-2-1 2-3.2 2.4-5.5 1.6M14.2 14c3.5 1 4.4 4.3 2 5.5-2-1-2.4-3.2-1.6-5.5M10 14.2c-1 3.5-4.3 4.4-5.5 2 1-2 3.2-2.4 5.5-1.6"],
  butterfly: ["M11.5 12c-1.8-4.8-5-6.7-7-4.8-1.4 1.4.2 4.4 4.7 5.3-4.5.9-6.1 3.9-4.7 5.3 2 1.9 5.2 0 7-4.8M12.5 12c1.8-4.8 5-6.7 7-4.8 1.4 1.4-.2 4.4-4.7 5.3 4.5.9 6.1 3.9 4.7 5.3-2 1.9-5.2 0-7-4.8M12 9v10"],
  heart: ["M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z"],
  smile: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z","M8.5 10h.1M15.5 10h.1M8.5 14c1 1.5 2.2 2.2 3.5 2.2s2.5-.7 3.5-2.2"],
  arrow: ["M5 12h13M14 7l5 5-5 5"]
};

function BubbleIcon({name,size=24,className=""}){
  const paths=ICONS[name] || ICONS.bubble;
  return <svg className={`bubble-icon-svg ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {paths.map((path,index)=><path key={index} d={path} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>)}
  </svg>;
}

function fromCloudMemory(row) {
  const raw = row.raw_entry || {};
  return {
    id: row.id,
    created_at: row.created_at,
    raw_text: raw.raw_text || row.story || "",
    summary: raw.summary || row.title || row.story || "Memory",
    encouragement: raw.encouragement || row.encouragement || "",
    categories: raw.categories || row.categories || ["life"],
    data: raw.data || row.stat_awards || {}
  };
}

function toCloudMemory(record, userId) {
  return {
    id: record.id,
    user_id: userId,
    happened_on: new Date(record.created_at).toISOString().slice(0,10),
    title: record.summary || record.raw_text || "Memory",
    story: record.raw_text || record.summary || "",
    encouragement: record.encouragement || "",
    categories: record.categories || ["life"],
    people: record.data?.people || [],
    stat_awards: record.data || {},
    raw_entry: record,
    source: record.is_seed || String(record.id || "").startsWith("seed-") ? "starter-history" : "chat",
    is_private: true
  };
}

function fromBubbleDay(row) {
  const health = row.health || {};
  const relHealth = row.relationship_with_health || {};
  const sectionText = Object.values(row.sections || {})
    .map(section => section?.story)
    .filter(Boolean)
    .join("\n\n");
  const categories = [];
  const tags = (row.tags || []).map(tag => String(tag).toLowerCase());
  if (tags.some(tag => tag.includes("health"))) categories.push("body");
  if (tags.some(tag => tag.includes("relationship"))) categories.push("relationships");
  if (tags.some(tag => tag.includes("growth") || tag.includes("boundary") || tag.includes("recovery") || tag.includes("values"))) categories.push("growth");
  if (!categories.length) categories.push("life");
  return {
    id: `day-${row.id}`,
    cloud_day_id: row.id,
    source_type: "bubble_day",
    created_at: `${row.entry_date}T12:00:00-05:00`,
    raw_text: sectionText || row.summary || row.title,
    summary: row.title || row.summary || "Daily Story",
    encouragement: row.is_pivotal ? "Pivotal Day 🫧" : row.status === "final" ? "Daily Story finalized. 🫧" : "Daily Story in progress.",
    categories: [...new Set(categories)],
    data: {
      sleep_hours: health.sleep_hours ?? null,
      water_oz: health.water_oz ?? (health.water_bottles ? Number(health.water_bottles) * 16.9 : null),
      miles: health.miles_walked ?? null,
      squats: health.squats ?? null,
      foods: health.foods || [],
      calories: row.nutrition?.estimated_calories ?? row.nutrition?.calories ?? health.calories ?? null,
      protein_g: row.nutrition?.estimated_protein_g ?? row.nutrition?.protein_g ?? health.protein_g ?? null,
      carbs_g: row.nutrition?.estimated_carbs_g ?? row.nutrition?.carbs_g ?? null,
      fat_g: row.nutrition?.estimated_fat_g ?? row.nutrition?.fat_g ?? null,
      added_sugar_g: row.nutrition?.estimated_added_sugar_g ?? row.nutrition?.added_sugar_g ?? null,
      caffeine_mg: row.nutrition?.estimated_caffeine_mg ?? row.nutrition?.caffeine_mg ?? null,
      fruit_veg: row.nutrition?.estimated_produce_servings ?? row.nutrition?.fruit_veg ?? null,
      maintenance_calories: row.nutrition?.maintenance_estimate_calories ?? row.nutrition?.maintenance_estimate ?? null,
      estimated_deficit_calories: row.nutrition?.estimated_deficit_calories ?? null,
      nutrition_confidence: row.nutrition?.confidence ?? null,
      calorie_status: row.calorie_status || row.nutrition?.calorie_status || null,
      people: row.people || [],
      lessons: row.lessons || [],
      patterns_noticed: row.sections?.pattern_insight?.story ? [row.sections.pattern_insight.story] : [],
      boundaries: row.tags?.some(tag => String(tag).toLowerCase().includes("boundar")) ? ["Protected a personal boundary."] : [],
      milestones: row.is_pivotal ? [row.title || "Pivotal Day"] : [],
      relationship_with_health: relHealth,
      stat_gains: row.stat_gains || {},
      wins: row.wins || [],
      status: row.status,
      entry_date: row.entry_date
    }
  };
}

function normalizeSeed(e, i) {
  const seedId = `00000000-0000-4000-8000-${String(i + 1).padStart(12,"0")}`;
  return { id: seedId, is_seed:true, summary:"", encouragement:"", categories:["life"], data:{}, ...e };
}
function save(entries) {
  localStorage.setItem(STORE, JSON.stringify(entries));
}
function fmt(v, digits=0) {
  return Number(v || 0).toLocaleString(undefined,{maximumFractionDigits:digits});
}
function n(v){ return Number.isFinite(Number(v)) ? Number(v) : 0; }

async function readApiJson(response) {
  const raw = await response.text();
  if (!raw) throw new Error(`Bubble received an empty server response (${response.status}).`);
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Bubble received an invalid server response (${response.status}).`);
  }
}

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

function confidenceLabel(values = []) {
  if (!values.length) return "Not estimated yet";
  if (values.includes("low")) return "Low confidence";
  if (values.includes("medium")) return "Medium confidence";
  return "High confidence";
}

function estimatedCalorieStatus(calories) {
  if (!calories) return "unknown";
  const maintenance = Number(PROFILE.estimatedMaintenanceCalories || 2000);
  if (calories < maintenance - 100) return "deficit";
  if (calories > maintenance + 100) return "surplus";
  return "maintenance";
}

export default function Home() {
  const [tab,setTab] = useState("chat");
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
  const [activeStat,setActiveStat] = useState(null);
  const [selectedMemory,setSelectedMemory] = useState(null);
  const [memoryFolder,setMemoryFolder] = useState("all");
  const [centralNow,setCentralNow] = useState(new Date());
  const [session,setSession] = useState(undefined);
  const [authMessage,setAuthMessage] = useState("");
  const [syncing,setSyncing] = useState(true);
  const [savingNutritionStatus,setSavingNutritionStatus] = useState(false);
  const [chatDay,setChatDay] = useState(null);
  const [chatMessages,setChatMessages] = useState([]);
  const [chatText,setChatText] = useState("");
  const [chatSending,setChatSending] = useState(false);
  const [chatArchive,setChatArchive] = useState([]);
  const [chatDateKey,setChatDateKey] = useState(centralDateKey());
  const supabase = useMemo(()=>getSupabaseBrowserClient(),[]);

  useEffect(()=>{
    const openMemory = event => setSelectedMemory(event.detail);
    window.addEventListener("open-bubble-memory", openMemory);
    const timer = setInterval(()=>setCentralNow(new Date()), 1000);

    async function loadForSession(nextSession) {
      setSession(nextSession);
      if (!nextSession?.user || !supabase) { setSyncing(false); return; }
      setSyncing(true);
      await supabase.from("profiles").upsert({user_id:nextSession.user.id,display_name:"Alli",timezone:BUBBLE_TIME_ZONE},{onConflict:"user_id"});
      await supabase.from("app_settings").upsert({user_id:nextSession.user.id},{onConflict:"user_id"});

      const entryDate = centralDateKey();
      await supabase.from("bubble_chat_days")
        .update({status:"archived",updated_at:new Date().toISOString()})
        .eq("user_id",nextSession.user.id)
        .lt("entry_date",entryDate)
        .eq("status","open");
      const {data:currentChat,error:chatDayError} = await supabase.from("bubble_chat_days")
        .upsert({user_id:nextSession.user.id,entry_date:entryDate,status:"open",title:"Today with Bubble",updated_at:new Date().toISOString()},{onConflict:"user_id,entry_date"})
        .select("*").single();
      const [{data:cloudRows,error},{data:dayRows,error:dayError},{data:messageRows,error:messageError},{data:archiveRows,error:archiveError}] = await Promise.all([
        supabase.from("memories").select("*").order("created_at",{ascending:false}),
        supabase.from("bubble_days").select("*").order("entry_date",{ascending:false}),
        currentChat ? supabase.from("bubble_chat_messages").select("*").eq("chat_day_id",currentChat.id).order("created_at",{ascending:true}) : Promise.resolve({data:[],error:null}),
        supabase.from("bubble_chat_days").select("*").order("entry_date",{ascending:false}).limit(60)
      ]);
      if (error || dayError || chatDayError || messageError || archiveError) {
        setAuthMessage("Bubble connected, but the cloud sync needs attention: " + (error?.message || dayError?.message || chatDayError?.message || messageError?.message || archiveError?.message));
        setSyncing(false);
        return;
      }

      setChatDay(currentChat || null);
      setChatMessages(messageRows || []);
      setChatArchive(archiveRows || []);
      setChatDateKey(entryDate);

      if ((cloudRows || []).length || (dayRows || []).length) {
        const cloudEntries=[
          ...(dayRows || []).map(fromBubbleDay),
          ...(cloudRows || []).map(fromCloudMemory)
        ].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
        setEntries(cloudEntries); save(cloudEntries);
      } else {
        const existing = JSON.parse(localStorage.getItem(STORE) || "[]");
        const personalEntries = existing.filter(entry => !String(entry.id || "").startsWith("seed-"));
        const seeded = [...SEED_ENTRIES.map(normalizeSeed), ...personalEntries]
          .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
        if (seeded.length) {
          const payload=seeded.map(record=>toCloudMemory(record,nextSession.user.id));
          const {error:seedError}=await supabase.from("memories").upsert(payload,{onConflict:"id"});
          if (seedError) setAuthMessage("Signed in, but starter history did not finish syncing: " + seedError.message);
          else setAuthMessage("Signed in. Your private Bubble history is now in the cloud. 🫧");
        }
        save(seeded); localStorage.setItem(SEEDED,"1"); setEntries(seeded);
      }
      setSyncing(false);
    }

    if (!supabase) { setSession(null); setSyncing(false); }
    supabase?.auth.getSession().then(({data})=>loadForSession(data.session));
    const {data:listener}=supabase?.auth.onAuthStateChange((_event,nextSession)=>loadForSession(nextSession)) || {data:null};
    return ()=>{
      clearInterval(timer);
      window.removeEventListener("open-bubble-memory", openMemory);
      listener?.subscription?.unsubscribe();
    };
  },[supabase]);

  useEffect(()=>{
    const nextKey = centralDateKey(centralNow);
    if (nextKey !== chatDateKey && session?.user) {
      setChatDateKey(nextKey);
      window.location.reload();
    }
  },[centralNow,chatDateKey,session]);

  const game = useMemo(()=>calculateGame(entries),[entries]);
  const today = useMemo(()=>todayTotals(entries),[entries]);
  const autoCalorieStatus = useMemo(()=>estimatedCalorieStatus(today.calories),[today.calories]);
  const displayedCalorieStatus = today.calorieStatus || autoCalorieStatus;
  const dailyMaintenance = today.maintenanceCalories || Number(PROFILE.estimatedMaintenanceCalories || 2000);
  const estimatedDeficit = today.estimatedDeficitCalories ?? (today.calories ? Math.round(dailyMaintenance - today.calories) : null);
  const checkQuestions = useMemo(()=>missingCheckInQuestions(entries,game.stats),[entries,game.stats]);
  const activeSnapshot = useMemo(()=>bubbleSnapshot(entries,activeBubble),[entries,activeBubble]);
  const centralDate = new Intl.DateTimeFormat("en-US", {
    timeZone:BUBBLE_TIME_ZONE, weekday:"long", month:"long", day:"numeric", year:"numeric"
  }).format(centralNow);
  const centralTime = new Intl.DateTimeFormat("en-US", {
    timeZone:BUBBLE_TIME_ZONE, hour:"numeric", minute:"2-digit", second:"2-digit", timeZoneName:"short"
  }).format(centralNow);
  const centralHour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone:BUBBLE_TIME_ZONE, hour:"2-digit", hour12:false
  }).format(centralNow));

  async function submitLog(extraText="", preferredCategory=null) {
    const content = (extraText || text).trim();
    if (!content || loading) return;
    setLoading(true); setNotice("");
    try {
      const res = await fetch("/api/parse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"log",text:content,profile:PROFILE,preferredCategory})});
      const parsed = await readApiJson(res);
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
      if (supabase && session?.user) {
        const { error } = await supabase.from("memories").insert(toCloudMemory(record,session.user.id));
        if (error) setNotice("Saved on this device, but cloud sync needs attention: " + error.message);
        else setNotice("Saved privately to Bubble. Your stats just moved. ✨");
      } else setNotice("Saved privately on this device. ✨");
    } catch(err) { setNotice(err.message); }
    finally { setLoading(false); }
  }

  async function sendChat() {
    const content = chatText.trim();
    if (!content || chatSending || !supabase || !session?.user || !chatDay) return;
    setChatSending(true); setNotice(""); setChatText("");
    const optimistic = {id:crypto.randomUUID(),role:"user",content,created_at:new Date().toISOString()};
    setChatMessages(prev=>[...prev,optimistic]);
    try {
      const {data:userMessage,error:userError} = await supabase.from("bubble_chat_messages").insert({
        chat_day_id:chatDay.id,user_id:session.user.id,entry_date:chatDateKey,role:"user",content
      }).select("*").single();
      if(userError) throw userError;
      setChatMessages(prev=>prev.map(message=>message.id===optimistic.id?userMessage:message));

      const memoryContext = entries.slice(0,120).map(entry=>({
        date:entry.data?.entry_date || entry.created_at?.slice(0,10),
        summary:entry.summary,
        text:entry.raw_text,
        categories:entry.categories,
        people:entry.data?.people || [],
        lessons:entry.data?.lessons || [],
        patterns:entry.data?.patterns_noticed || []
      }));
      const response = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        text:content,entryDate:chatDateKey,profile:PROFILE,memories:memoryContext,
        todayMessages:[...chatMessages,{role:"user",content}].map(message=>({role:message.role,content:message.content}))
      })});
      const parsed = await readApiJson(response);
      if(!response.ok) throw new Error(parsed.error || "Bubble could not answer.");

      const {data:assistantMessage,error:assistantError} = await supabase.from("bubble_chat_messages").insert({
        chat_day_id:chatDay.id,user_id:session.user.id,entry_date:chatDateKey,role:"assistant",content:parsed.reply,
        metadata:{logged:parsed.should_log,categories:parsed.categories || []}
      }).select("*").single();
      if(assistantError) throw assistantError;
      setChatMessages(prev=>[...prev,assistantMessage]);
      if(parsed.degraded) setNotice("Your message was saved, but Bubble’s AI connection had a temporary problem. You can keep using the app and try again normally.");

      if(parsed.should_log){
        const record={id:crypto.randomUUID(),created_at:new Date().toISOString(),raw_text:content,summary:parsed.summary || content,encouragement:parsed.encouragement || "",categories:parsed.categories || ["life"],data:parsed.data || {}};
        const {error:memoryError}=await supabase.from("memories").insert(toCloudMemory(record,session.user.id));
        if(memoryError) throw memoryError;
        const next=[record,...entries]; setEntries(next); save(next);
      }
      await supabase.from("bubble_chat_days").update({updated_at:new Date().toISOString()}).eq("id",chatDay.id);
    } catch(error) {
      setNotice("Bubble chat needs attention: " + error.message);
      setChatText(content);
    } finally { setChatSending(false); }
  }

  async function saveCalorieStatus(status) {
    if (!supabase || !session?.user || savingNutritionStatus) return;
    setSavingNutritionStatus(true);
    setNotice("");
    try {
      const entryDate = centralDateKey();
      const { data: existing, error: readError } = await supabase
        .from("bubble_days")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("entry_date", entryDate)
        .maybeSingle();
      if (readError) throw readError;

      const nutrition = {
        ...(existing?.nutrition || {}),
        calories: today.calories || null,
        protein_g: today.protein || null,
        carbs_g: today.carbs || null,
        fat_g: today.fat || null,
        added_sugar_g: today.addedSugar || null,
        caffeine_mg: today.caffeine || null,
        fruit_veg: today.produce || null,
        confidence: confidenceLabel(today.nutritionConfidence).split(" ")[0].toLowerCase(),
        calorie_status: status,
        maintenance_estimate: PROFILE.estimatedMaintenanceCalories || 2000,
        status_source: "user"
      };
      const payload = {
        ...(existing || {}),
        user_id: session.user.id,
        entry_date: entryDate,
        title: existing?.title || "Daily Story",
        summary: existing?.summary || "",
        calorie_status: status,
        nutrition,
        updated_at: new Date().toISOString()
      };
      delete payload.id;
      delete payload.created_at;

      const { data: saved, error } = await supabase
        .from("bubble_days")
        .upsert(payload,{onConflict:"user_id,entry_date"})
        .select("*")
        .single();
      if (error) throw error;

      const updatedDay = fromBubbleDay(saved);
      const withoutDay = entries.filter(entry => !(entry.source_type === "bubble_day" && entry.data?.entry_date === entryDate));
      const next = [updatedDay, ...withoutDay].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
      setEntries(next); save(next);
      setNotice(`Calorie status saved as ${status}. 🫧`);
    } catch (error) {
      setNotice("Bubble could not save that calorie status: " + error.message);
    } finally {
      setSavingNutritionStatus(false);
    }
  }

  async function askHistory() {
    if (!historyQuery.trim()) return;
    setLoading(true); setHistoryAnswer("");
    try {
      const res=await fetch("/api/parse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"query",text:historyQuery,history:entries.slice(0,250),profile:PROFILE})});
      const data=await readApiJson(res);
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

  async function deleteEntry(id) {
    const next=entries.filter(e=>e.id!==id); setEntries(next); save(next);
    if (supabase && session?.user) {
      const entry = entries.find(e => e.id === id);
      const query = entry?.source_type === "bubble_day"
        ? supabase.from("bubble_days").delete().eq("id", entry.cloud_day_id)
        : supabase.from("memories").delete().eq("id",id);
      const {error}=await query;
      if (error) setNotice("Removed on this device, but cloud deletion needs attention: " + error.message);
    }
  }

  async function signOut(){
    await supabase?.auth.signOut();
    setEntries([]);
    setAuthMessage("");
  }

  function openBubble(key){
    setActiveBubble(key);
    setTab("bubble-detail");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  if (session === undefined || syncing) return <AuthShell><div className="auth-card card"><p className="soft">PRIVATE BUBBLE</p><h2>Loading your world…</h2><p>Pulling your memories safely from Supabase.</p></div></AuthShell>;
  if (!session) return <LoginScreen supabase={supabase} message={authMessage} setMessage={setAuthMessage}/>;

  return (
    <main className="shell">
      <header className="header">
        <div className="brand">
          <span className="tiny">ALLI'S LIFE LEARNING BUBBLE</span>
          <h1>Bubble <span><BubbleIcon name="bubble" size={30}/></span></h1>
          <p>Live your life. Bubble organizes it.</p>
        </div>
<div className="header-actions"><button className="level-chip" onClick={()=>setTab("home")}>
          <span>🫧</span>
          <div><b>Level {game.level}</b><small>{game.level<3?"Brave Bubble":game.level<6?"Strong Bubble":"Unstoppable Bubble"}</small></div>
        </button><button className="signout-button" onClick={signOut}>Sign out</button></div>
      </header>

      {authMessage && <div className="notice cloud-notice">{authMessage}</div>}
      <nav className="nav">
        {["chat","home","bubbles","memories","history"].map(x=><button key={x} className={(tab===x || (x==="bubbles"&&tab==="bubble-detail"))?"active":""} onClick={()=>setTab(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}
      </nav>

      {tab==="chat" && <DailyBubbleChat
        messages={chatMessages}
        text={chatText}
        setText={setChatText}
        send={sendChat}
        sending={chatSending}
        notice={notice}
        dateLabel={centralDate}
        timeLabel={centralTime}
        archive={chatArchive}
        today={today}
        openHome={()=>setTab("home")}
      />}

      {tab==="home" && <>
        <section className="home-overview card clean-overview">
          <div className="overview-level">
            <p className="soft">YOUR CURRENT OVERVIEW</p>
            <h2>Level {game.level}</h2>
            <h3>{game.level<3?"Brave Bubble":game.level<6?"Strong Bubble":"Unstoppable Bubble"}</h3>
            <div className="xp-label"><span>XP</span><b>{game.levelXP} / 100</b></div>
            <div className="bar"><i style={{width:`${game.levelXP}%`}}/></div>
            <small>{game.nextLevelXP} XP to next level</small>
          </div>
          <div className="clock-card">
            <span>📍 Arkansas · Central Time</span>
            <b>{centralTime}</b>
            <small>{centralDate}</small>
          </div>
          <button className="memory-count-card" onClick={()=>setTab("memories")}>
            <span>🫧</span>
            <div><b>{game.totals.checkins}</b><small>Total memories</small></div>
            <em>Open library →</em>
          </button>
        </section>

        <section className="home-columns">
          <aside className="stats-column">
            <div className="column-title">
              <div><p className="soft">OVERALL STATS</p><h2>Your character</h2></div>
              <small>Tap any stat to see exactly where it came from.</small>
            </div>
            <div className="stat-list">
              <Stat name="Strength" icon="strength" value={game.stats.strength} desc="squats + resistance + workouts" onClick={()=>setActiveStat("strength")}/>
              <Stat name="Agility" icon="agility" value={game.stats.agility} desc="walking + stairs + movement" onClick={()=>setActiveStat("agility")}/>
              <Stat name="Health" icon="health" value={game.stats.health} desc="fuel + hydration + consistency" onClick={()=>setActiveStat("health")}/>
              <Stat name="Sleep" icon="sleep" value={game.stats.sleep} desc="hours + sleep quality" onClick={()=>setActiveStat("sleep")}/>
              <Stat name="Resilience" icon="resilience" value={game.stats.resilience} desc="showing up through hard things" onClick={()=>setActiveStat("resilience")}/>
              <Stat name="Wisdom" icon="wisdom" value={game.stats.wisdom} desc="reflection + patterns" onClick={()=>setActiveStat("wisdom")}/>
              <Stat name="Social" icon="social" value={game.stats.social} desc="connection + boundaries" onClick={()=>setActiveStat("social")}/>
              <Stat name="Creativity" icon="creativity" value={game.stats.creativity} desc="art + play + expression" onClick={()=>setActiveStat("creativity")}/>
              <Stat name="Finance" icon="finance" value={game.stats.finance} desc="money awareness + planning" onClick={()=>setActiveStat("finance")}/>
            </div>
            <ZeroStatQuestions
              stats={game.stats}
              onAnswer={(question)=>{
                setText(question + " ");
                setTab("home");
                setTimeout(()=>window.scrollTo({top:document.body.scrollHeight/4,behavior:"smooth"}),50);
              }}
            />
          </aside>

          <div className="checkin-column">
            <section className="hero card">
              <div className="hero-copy">
                <p className="soft">Good {centralHour<12?"morning":centralHour<18?"afternoon":"evening"}, Alli.</p>
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

            <section className="daily-title"><h3>Today's totals</h3><span>{today.hasDailySummary ? `${today.dailyStatus === "final" ? "Finalized" : "Draft"} daily summary` : `${today.entries} Central-time check-in${today.entries===1?"":"s"}`}</span></section>
            <section className="today-grid">
              <Mini icon="health" label="Calories" value={today.calories?`~${fmt(today.calories)}`:"—"}/>
              <Mini icon="health" label="Protein" value={today.protein?`${fmt(today.protein)}g`:"—"}/>
              <Mini icon="health" label="Carbs" value={today.carbs?`${fmt(today.carbs)}g`:"—"}/>
              <Mini icon="health" label="Fat" value={today.fat?`${fmt(today.fat)}g`:"—"}/>
              <Mini icon="agility" label="Miles walked" value={today.miles?fmt(today.miles,2):"—"}/>
              <Mini icon="strength" label="Squats" value={today.squats?fmt(today.squats):"—"}/>
              <Mini icon="health" label="Water" value={today.water?`${fmt(today.water)} oz`:"—"}/>
              <Mini icon="sleep" label="Sleep" value={today.sleep?`${fmt(today.sleep,1)} hr`:"—"}/>
            </section>

            <section className="nutrition-intelligence card">
              <div className="section-head">
                <div><p className="soft">FOOD INTELLIGENCE</p><h3>Today’s nutrition snapshot</h3></div>
                <span className={`nutrition-confidence ${confidenceLabel(today.nutritionConfidence).split(" ")[0].toLowerCase()}`}>{confidenceLabel(today.nutritionConfidence)}</span>
              </div>
              <div className="nutrition-metrics">
                <span><b>{today.protein ? `${fmt(today.protein)}g` : "—"}</b><small>protein / {PROFILE.proteinGoalGrams}g goal</small></span>
                <span><b>{today.produce ? fmt(today.produce,1) : "—"}</b><small>produce servings</small></span>
                <span><b>{today.caffeine ? `${fmt(today.caffeine)}mg` : "—"}</b><small>caffeine</small></span>
                <span><b>{today.addedSugar ? `${fmt(today.addedSugar)}g` : "—"}</b><small>added sugar</small></span>
              </div>
              <div className="calorie-status-row">
                <div>
                  <h4>Calorie status</h4>
                  <p>{today.calories ? `Based on ~${fmt(today.calories)} calories and an estimated ${fmt(dailyMaintenance)}-calorie maintenance level.` : "Log food and Bubble will estimate this automatically."}</p>
                  {estimatedDeficit !== null && <small>{estimatedDeficit > 0 ? `Estimated ${fmt(estimatedDeficit)} calorie deficit` : estimatedDeficit < 0 ? `Estimated ${fmt(Math.abs(estimatedDeficit))} calorie surplus` : "Near estimated maintenance"}</small>}
                </div>
                <div className="status-options" role="group" aria-label="Daily calorie status">
                  {["deficit","maintenance","surplus"].map(status=><button key={status} className={displayedCalorieStatus===status?"selected":""} onClick={()=>saveCalorieStatus(status)} disabled={savingNutritionStatus}>
                    <span>{displayedCalorieStatus===status?"☑":"☐"}</span>{status[0].toUpperCase()+status.slice(1)}
                  </button>)}
                </div>
              </div>
              <p className="nutrition-note">Estimates are guidance, not exact measurements. Labels and exact brand details raise confidence automatically.</p>
            </section>

            <section className="checkin card">
              <div className="section-head"><div><p className="soft">STAT CHECK</p><h3>Bubble is missing a few things</h3></div><span className="pulse"><BubbleIcon name="smile" size={20}/></span></div>
              {checkQuestions.length ? checkQuestions.map(q=><button key={q} onClick={()=>answerQuestion(q)}>{q}<span>Answer →</span></button>) :
              <p className="complete">Everything important is updated for today. Tiny victory. ✨</p>}
            </section>

            <section className="quests card">
              <div className="section-head"><div><p className="soft">DAILY QUESTS</p><h3>Today's little missions</h3></div><span><BubbleIcon name="heart" size={26}/></span></div>
              <Quest done={today.miles>=1} label="Walk at least one mile" reward="+8 agility XP"/>
              <Quest done={today.squats>=60} label="Complete 60 squats" reward="+8 strength XP"/>
              <Quest done={today.protein>=80} label="Reach 80g protein" reward="+6 health XP"/>
              <Quest done={today.water>=64} label="Drink 64 oz water" reward="+6 health XP"/>
              <Quest done={today.sleep>=7} label="Log 7+ hours of sleep" reward="+8 sleep XP"/>
            </section>

            <section className="sparkle-shelf card">
              <div className="section-head"><div><p className="soft">SPECIAL THINGS</p><h3>Milestones & achievements</h3></div><span><BubbleIcon name="flower" size={28}/></span></div>
              <div className="sparkle-grid">
                <div>
                  <h4>Milestones</h4>
                  {game.milestones.length ? game.milestones.slice(0,3).map(item=><button key={item.id} onClick={()=>setSelectedMemory(item.entry)}><BubbleIcon name="heart" size={17}/> {item.text}</button>) : <p>No milestone recorded yet. They are supposed to be rare.</p>}
                </div>
                <div>
                  <h4>Achievements</h4>
                  {game.achievements.length ? game.achievements.slice(-3).map(item=><span key={item.id}><BubbleIcon name={item.icon} size={18}/> <b>{item.name}</b><small>{item.detail}</small></span>) : <p>Your first achievement is waiting. 🫧</p>}
                </div>
              </div>
            </section>

            <section className="lifetime card">
              <h3>Lifetime adventure totals</h3>
              <div><span><b>{fmt(game.totals.miles,2)}</b><small>miles</small></span><span><b>{fmt(game.totals.squats)}</b><small>squats</small></span><span><b>{fmt(game.totals.workoutMinutes)}</b><small>workout min</small></span><button className="lifetime-memory-button" onClick={()=>setTab("memories")}><b>{fmt(game.totals.checkins)}</b><small>memories</small><em>Open →</em></button></div>
            </section>
          </div>
        </section>
      </>}

      {tab==="bubbles" && <section>
        <div className="page-title"><p className="soft">ONE LIFE, DIFFERENT VIEWS</p><h2>Your Bubbles</h2><p>Click any Bubble to see its overview, stats, history, and add an update directly.</p></div>
        <div className="bubble-grid">
          {Object.entries(BUBBLES).map(([key,b])=><button className={`bubble-card ${b.color}`} key={key} onClick={()=>openBubble(key)}><span><BubbleIcon name={b.icon} size={32}/></span><h3>{b.name}</h3><p>{b.blurb}</p><i>Open Bubble →</i></button>)}
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

      {tab==="memories" && <MemoryLibrary
        entries={entries}
        folder={memoryFolder}
        setFolder={setMemoryFolder}
        selected={selectedMemory}
        setSelected={setSelectedMemory}
        openBubble={openBubble}
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

      {selectedMemory && <MemoryModal memory={selectedMemory} onClose={()=>setSelectedMemory(null)} openBubble={(key)=>{setSelectedMemory(null);openBubble(key)}}/>}
      {activeStat && <StatDetail statKey={activeStat} value={game.stats[activeStat]} entries={entries} onClose={()=>setActiveStat(null)}/>}
      <footer>Built with 🫧, stubbornness, and an entirely reasonable number of “ew”s.</footer>
    </main>
  );
}

function DailyBubbleChat({messages,text,setText,send,sending,notice,dateLabel,timeLabel,archive,today,openHome}){
  const handleKeyDown = event => {
    if(event.key === "Enter" && !event.shiftKey){ event.preventDefault(); send(); }
  };
  return <section className="daily-chat-page">
    <div className="chat-day-header card">
      <div><p className="soft">TODAY WITH BUBBLE</p><h2>{dateLabel}</h2><p>{timeLabel} · Everything in this thread belongs to today.</p></div>
      <button onClick={openHome}>View today’s stats →</button>
    </div>
    <div className="chat-layout">
      <section className="chat-window card">
        <div className="chat-messages">
          {!messages.length && <div className="bubble-welcome">
            <span>🫧</span><h3>Hey Alli. Fresh day, same Bubble.</h3>
            <p>Talk to me exactly like you do in ChatGPT. I’ll answer, give advice, remember what matters, and quietly organize today’s food, movement, feelings, relationships, work, and growth.</p>
          </div>}
          {messages.map(message=><article key={message.id} className={`chat-message ${message.role}`}>
            <small>{message.role === "assistant" ? "Bubble" : "You"}</small>
            <p>{message.content}</p>
          </article>)}
          {sending && <article className="chat-message assistant thinking"><small>Bubble</small><p>thinking through this with you…</p></article>}
        </div>
        <div className="chat-composer">
          <textarea value={text} onChange={event=>setText(event.target.value)} onKeyDown={handleKeyDown} placeholder="Tell me what’s going on… food, Justin, work, a random thought, all of it."/>
          <div><small>Enter sends · Shift + Enter adds a line</small><button className="primary" onClick={send} disabled={!text.trim()||sending}>{sending?"Thinking…":"Send 🫧"}</button></div>
          {notice && <div className="notice">{notice}</div>}
        </div>
      </section>
      <aside className="chat-side">
        <section className="card chat-today-card"><p className="soft">QUIETLY TRACKING TODAY</p><h3>Your live snapshot</h3>
          <div><span><b>{today.calories?`~${fmt(today.calories)}`:"—"}</b><small>calories</small></span><span><b>{today.protein?`${fmt(today.protein)}g`:"—"}</b><small>protein</small></span><span><b>{today.water?`${fmt(today.water)} oz`:"—"}</b><small>water</small></span><span><b>{today.miles?fmt(today.miles,2):"—"}</b><small>miles</small></span></div>
          <button onClick={openHome}>Open full dashboard</button>
        </section>
        <section className="card chat-archive-card"><p className="soft">DAILY ARCHIVE</p><h3>Your previous days</h3>
          {(archive || []).filter(day=>day.status==="archived").slice(0,7).map(day=><div key={day.id}><b>{new Date(`${day.entry_date}T12:00:00`).toLocaleDateString([],{month:"long",day:"numeric"})}</b><small>Archived conversation</small></div>)}
          {!archive?.some(day=>day.status==="archived") && <p>Your first archived day will appear here tomorrow.</p>}
        </section>
      </aside>
    </div>
  </section>;
}

function BubbleDetail({bubbleKey,bubble,snapshot,text,setText,loading,notice,submit,back}){
  const t=snapshot.totals;
  const stats = {
    body:[
      ["agility","Miles",fmt(t.miles,2)],["strength","Squats",fmt(t.squats)],["strength","Workout min",fmt(t.workout)],
      ["health","Protein logged",`${fmt(t.protein)}g`],["sleep","Avg sleep",t.sleepLogs?`${fmt(t.sleep/t.sleepLogs,1)} hr`:"—"]
    ],
    relationships:[
      ["social","Relationship entries",snapshot.relevant.length],["social","People tracked",snapshot.people.length],
      ["mind","Latest mood",snapshot.mood||"—"],["resilience","Boundary growth",fmt(t.growth)]
    ],
    mind:[
      ["mind","Mind check-ins",snapshot.relevant.length],["mind","Latest mood",snapshot.mood||"—"],
      ["growth","Growth points",fmt(t.growth)],["🌙","Sleep logs",t.sleepLogs]
    ],
    work:[
      ["work","Work check-ins",snapshot.relevant.length],["mind","Latest stress",snapshot.latest?.data?.work_stress ?? "—"],
      ["growth","Growth points",fmt(t.growth)]
    ],
    money:[
      ["finance","Spending logged",`$${fmt(t.spending,2)}`],["finance","Money check-ins",snapshot.relevant.length]
    ],
    creativity:[
      ["creativity","Creative moments",snapshot.relevant.length],["growth","Growth points",fmt(t.growth)]
    ],
    fun:[
      ["fun","Fun moments",snapshot.relevant.length],["🚶‍♀️","Adventure miles",fmt(t.miles,2)]
    ],
    growth:[
      ["growth","Growth entries",snapshot.relevant.length],["growth","Growth points",fmt(t.growth)],
      ["resilience","Times you showed up",snapshot.relevant.length]
    ]
  }[bubbleKey] || [];

  return <section className="bubble-detail">
    <button className="back-button" onClick={back}>← All Bubbles</button>
    <section className={`bubble-overview card ${bubble.color}`}>
      <div className="overview-icon"><BubbleIcon name={bubble.icon} size={46}/></div>
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
      <div className="section-head"><div><p className="soft">UPDATE THIS BUBBLE</p><h3>What changed in {bubble.name.toLowerCase()}?</h3></div><span><BubbleIcon name={bubble.icon} size={30}/></span></div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Tell Bubble anything about ${bubble.name.toLowerCase()}—no form, no organizing.`}/>
      <div className="send-row"><small>This update will always be saved inside the {bubble.name} Bubble, and can affect other stats too.</small><button className="primary" disabled={!text.trim()||loading} onClick={submit}>{loading?"Thinking...":"Update Bubble ✨"}</button></div>
      {notice && <div className="notice">{notice}</div>}
    </section>

    <section className="bubble-history">
      <div className="daily-title"><h3>Recent {bubble.name.toLowerCase()} history</h3><span>{snapshot.relevant.length} entries</span></div>
      {snapshot.recent.length ? snapshot.recent.map(e=><button className="entry card memory-entry-button" key={e.id} onClick={()=>window.dispatchEvent(new CustomEvent("open-bubble-memory",{detail:e}))}><time>{new Date(e.created_at).toLocaleDateString([],{dateStyle:"medium"})}</time><h3>{e.summary}</h3><p>{e.raw_text}</p>{e.encouragement&&<blockquote>{e.encouragement}</blockquote>}</button>) : <div className="card empty">This Bubble is ready for its first real update. 🫧</div>}
    </section>
  </section>
}


function ZeroStatQuestions({stats,onAnswer}){
  const prompts={
    strength:"What strength work have you done lately—squats, push-ups, curls, weights, bands, or anything similar? Include counts when you know them.",
    agility:"How much have you walked, climbed stairs, swam, or done cardio lately? Miles, minutes, steps, or flights all work.",
    health:"What have you eaten and drunk today? Especially protein, fruit, vegetables, and water.",
    sleep:"How many hours did you sleep last night, and how would you rate the quality from 1–5?",
    resilience:"What hard thing have you handled recently, and what did you do to protect or support yourself?",
    wisdom:"What have you realized about yourself lately—any pattern, need, value, or lesson?",
    social:"Who have you connected with lately, and how did that interaction actually feel?",
    creativity:"Have you made, styled, written, drawn, designed, or expressed anything lately?",
    finance:"Have you spent, earned, saved, budgeted, or planned any money recently?"
  };
  const missing=Object.keys(prompts).filter(key=>stats[key]===0);
  if(!missing.length)return null;
  return <section className="zero-stat card">
    <p className="soft">START YOUR EMPTY STATS</p>
    <h3>Bubble needs a little context</h3>
    <p>You are not supposed to know what to log. Tap one and Bubble will ask the exact question.</p>
    <div>{missing.slice(0,5).map(key=><button key={key} onClick={()=>onAnswer(prompts[key])}><span>{key}</span><em>Start →</em></button>)}</div>
  </section>
}

function MemoryLibrary({entries,folder,setFolder,selected,setSelected,openBubble}){
  const folders=[
    ["all","memories","All memories"],
    ["body","body","Body"],
    ["relationships","relationships","Relationships"],
    ["mind","mind","Mind"],
    ["work","work","Work"],
    ["money","money","Money"],
    ["creativity","creativity","Creativity"],
    ["fun","fun","Fun"],
    ["growth","growth","Growth"]
  ];
  const filtered=folder==="all"?entries:entries.filter(e=>(e.categories||[]).includes(folder));
  const grouped=filtered.reduce((acc,e)=>{
    const key=new Intl.DateTimeFormat("en-US",{timeZone:BUBBLE_TIME_ZONE,year:"numeric",month:"long"}).format(new Date(e.created_at));
    (acc[key] ||= []).push(e);
    return acc;
  },{});
  return <section className="memory-library">
    <div className="page-title"><p className="soft">TOTAL MEMORIES</p><h2>Your memory library</h2><p>Every check-in lives here and is also filed inside its relevant Bubble folders.</p></div>
    <div className="memory-folders">
      {folders.map(([key,icon,label])=><button key={key} className={folder===key?"active":""} onClick={()=>setFolder(key)}><span><BubbleIcon name={icon} size={24}/></span><b>{label}</b><small>{key==="all"?entries.length:entries.filter(e=>(e.categories||[]).includes(key)).length}</small></button>)}
    </div>
    <div className="memory-groups">
      {Object.entries(grouped).map(([month,items])=><section key={month}>
        <div className="memory-month"><h3>{month}</h3><span>{items.length} memories</span></div>
        <div className="memory-grid">
          {items.map(memory=><button key={memory.id} className="memory-card card" onClick={()=>setSelected(memory)}>
            <time>{new Intl.DateTimeFormat("en-US",{timeZone:BUBBLE_TIME_ZONE,month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(memory.created_at))}</time>
            <h3>{memory.summary||memory.raw_text}</h3>
            <p>{memory.raw_text}</p>
            <div>{(memory.categories||["life"]).map(c=><span key={c}>{c}</span>)}</div>
          </button>)}
        </div>
      </section>)}
      {!filtered.length&&<div className="empty card">No memories in this folder yet. Bubble will help you start it. 🫧</div>}
    </div>
  </section>
}

function MemoryModal({memory,onClose,openBubble}){
  return <div className="memory-modal-backdrop" onClick={onClose}>
    <section className="memory-modal card" onClick={e=>e.stopPropagation()}>
      <button className="stat-close" onClick={onClose}>×</button>
      <p className="soft">MEMORY</p>
      <time>{new Intl.DateTimeFormat("en-US",{timeZone:BUBBLE_TIME_ZONE,dateStyle:"full",timeStyle:"short"}).format(new Date(memory.created_at))}</time>
      <h2>{memory.summary||memory.raw_text}</h2>
      <p className="memory-full-text">{memory.raw_text}</p>
      {memory.encouragement&&<blockquote>{memory.encouragement}</blockquote>}
      <div className="memory-tags">{(memory.categories||["life"]).map(c=><button key={c} onClick={()=>openBubble(c)}>{c}</button>)}</div>
      <MemoryData data={memory.data||{}}/>
    </section>
  </div>
}

function MemoryData({data}){
  const items=[
    ["Calories",data.calories&&`~${Math.round(data.calories)}`],
    ["Protein",data.protein_g&&`${Math.round(data.protein_g)}g`],
    ["Miles",data.miles&&Number(data.miles).toFixed(2)],
    ["Squats",data.squats&&Math.round(data.squats)],
    ["Water",data.water_oz&&`${Math.round(data.water_oz)} oz`],
    ["Sleep",data.sleep_hours&&`${Number(data.sleep_hours).toFixed(1)} hr`],
    ["Mood",data.mood],
    ["Spending",data.spending&&`$${Number(data.spending).toFixed(2)}`]
  ].filter(([,value])=>value);
  if(!items.length)return null;
  return <div className="memory-data">{items.map(([label,value])=><span key={label}><small>{label}</small><b>{value}</b></span>)}</div>
}

function Mini({icon,label,value}){return <article className="mini card"><span><BubbleIcon name={icon} size={24}/></span><small>{label}</small><b>{value}</b></article>}
function Quest({done,label,reward}){return <div className={`quest ${done?"done":""}`}><span>{done?"✓":"○"}</span><div><b>{label}</b><small>{reward}</small></div></div>}
function Stat({name,icon,value,desc,onClick}){return <button className="stat card stat-button" onClick={onClick}><div className="stat-head"><span><BubbleIcon name={icon} size={26}/></span><div><b>{name}</b><small>{desc}</small></div><strong>{value}</strong></div><div className="bar"><i style={{width:`${value}%`}}/></div><em>View sources →</em></button>}

function statContributions(entries,key){
  return entries
    .map(entry => {
      const contribution = getStatContribution(entry,key);
      return {...entry,...contribution};
    })
    .filter(entry => entry.points > 0)
    .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
}


function explainContribution(statKey,entry){
  const d=entry.data||{};
  const summary=(entry.summary||entry.raw_text||"this memory").replace(/[.]+$/,"");
  const reasons=(entry.reasons||[]);
  const first=reasons[0]||"something directly relevant was recorded";

  if(statKey==="strength"){
    if(d.squats) return `Because in this memory, you actually did ${Math.round(Number(d.squats))} squats. That is not just “being active”—that is direct leg-strength work, so Bubble let this memory move Strength.`;
    if(d.strength_reps) return `You logged ${Math.round(Number(d.strength_reps))} real strength reps here. Bubble linked it because your body had to push, pull, or resist—not just move around.`;
    if(d.strength_minutes) return `You spent ${Math.round(Number(d.strength_minutes))} minutes intentionally strength training in this memory, so it belongs here.`;
  }

  if(statKey==="agility"){
    if(d.miles) return `You moved ${Number(d.miles).toFixed(Number(d.miles)%1?2:0)} mile${Number(d.miles)===1?"":"s"} in this memory. Bubble counts that toward Agility because it built your movement endurance, not because the entry merely mentioned exercise.`;
    if(d.steps) return `This one logged ${Math.round(Number(d.steps)).toLocaleString()} steps. That is concrete movement data, so Bubble used it to grow Agility.`;
    if(d.flights) return `You climbed ${Math.round(Number(d.flights))} flight${Number(d.flights)===1?"":"s"} of stairs here. That directly challenged your movement and stamina, which is why this memory belongs under Agility.`;
    if(d.cardio_minutes) return `You gave ${Math.round(Number(d.cardio_minutes))} minutes to cardio or active movement in this memory. Bubble linked the time you actually spent moving—not just the fact that a workout happened.`;
  }

  if(statKey==="health"){
    const pieces=[];
    if(d.protein_g) pieces.push(`${Math.round(Number(d.protein_g))}g of protein`);
    if(d.fruit_veg) pieces.push(`${Number(d.fruit_veg)} fruit or vegetable serving${Number(d.fruit_veg)===1?"":"s"}`);
    if(d.water_oz) pieces.push(`${Math.round(Number(d.water_oz))} oz of water`);
    return `This memory gave Bubble real care data: ${pieces.join(", ")}. That is why it helped Health—because you fueled or hydrated yourself in a measurable way.`;
  }

  if(statKey==="sleep"){
    return `You told Bubble you slept ${Number(d.sleep_hours).toFixed(Number(d.sleep_hours)%1?1:0)} hours${d.sleep_quality?` with a quality of ${d.sleep_quality}/5`:""}. Sleep can only learn from nights you actually record, so this memory directly shaped the stat.`;
  }

  if(statKey==="resilience"){
    const action=(d.coping_actions||[])[0]||(d.boundaries||[])[0]||(d.recovery_actions||[])[0];
    if(action) return `This memory mattered because you did something with the hard feeling: ${action}. Bubble counted the action—not just the pain—as Resilience.`;
    return `Bubble linked “${summary}” because this memory records a real coping, recovery, or self-protection action.`;
  }

  if(statKey==="wisdom"){
    const lesson=(d.lessons||[])[0];
    const fact=(d.facts_learned||[])[0];
    const pattern=(d.patterns_noticed||[])[0];
    if(lesson) return `This memory taught you something you can carry forward: “${lesson}” That is exactly what Wisdom is supposed to hold.`;
    if(fact) return `You learned a concrete fact here: “${fact}” Bubble linked it because this stat is about what you know now that you did not know before.`;
    if(pattern) return `You noticed a repeated pattern here: “${pattern}” Bubble counted it because seeing the pattern gives you a better chance to choose differently next time.`;
    return `Bubble linked “${summary}” because it contains a real lesson, fact, or pattern—not just an emotion or event.`;
  }

  if(statKey==="social"){
    const people=(d.people||[]).join(", ");
    if(d.relationship_event) return `This memory changed your relationship story: ${d.relationship_event}${people?` with ${people}`:""}. That is why it belongs under Social.`;
    if(people) return `You were processing a real connection involving ${people}. Bubble linked it because Social is meant to reflect the relationships you are actually living through.`;
  }

  if(statKey==="creativity"){
    const action=(d.creative_actions||[])[0];
    return action
      ? `You expressed yourself here by ${action.toLowerCase()}. Bubble linked the thing you actually made or chose—not just the fact that you had fun.`
      : `This memory holds a specific act of self-expression, which is why it moved Creativity.`;
  }

  if(statKey==="finance"){
    const action=(d.money_actions||[])[0];
    if(action) return `You took a real money action here: ${action}. Bubble linked it because Finance should grow from choices and awareness, not shame.`;
    if(d.spending) return `You recorded $${Number(d.spending).toFixed(2)} here. Bubble used this memory because honest spending awareness is part of building your Finance stat.`;
  }

  return `Bubble linked “${summary}” because ${first.toLowerCase()}.`;
}
function StatDetail({statKey,value,entries,onClose}){
  const config={strength:["Strength","strength",0,"Only documented squats, non-squat strength repetitions, and explicitly timed strength training."],agility:["Agility","agility",0,"Only documented miles, steps, flights of stairs, and explicitly timed cardio or active movement."],health:["Health","health",0,"Protein entries of at least 25g, documented fruit and vegetables, and hydration entries of at least 32 oz."],sleep:["Sleep","sleep",0,"One point for logging sleep, with additional points for seven or more hours and high reported sleep quality."],resilience:["Resilience","resilience",0,"Only actions you actually took to cope, recover, or protect your peace."],wisdom:["Wisdom","wisdom",0,"Only explicit lessons, facts learned, and repeated patterns you have actually noticed."],social:["Social","social",0,"Relationship entries that name a person or a specific relationship event."],creativity:["Creativity","creativity",0,"Only specific creative or self-expression actions you actually did."],finance:["Finance","finance",0,"Only entries explicitly categorized as money, spending, income, budgeting, or planning."]}[statKey];
  const rows=statContributions(entries,statKey); const raw=rows.reduce((a,r)=>a+r.points,0);
  return <div className="stat-modal-backdrop" onClick={onClose}><section className="stat-modal card" onClick={e=>e.stopPropagation()}>
    <button className="stat-close" onClick={onClose}>×</button>
    <div className="stat-modal-title"><span><BubbleIcon name={config[1]} size={36}/></span><div><p className="soft">YOUR STAT STORY</p><h2>{config[0]}: {value}</h2></div></div>
    <p>{config[3]}</p><div className="stat-equation"><span>Where you started</span><b>{config[2]}</b><span>What you have built</span><b>{raw.toFixed(1)}</b><span>Where you are now</span><b>{value}</b></div>
    <h3>Memories that built this</h3><div className="stat-sources">{rows.length?rows.map(r=><article key={r.id}><div><time>{new Date(r.created_at).toLocaleDateString("en-US",{timeZone:BUBBLE_TIME_ZONE,dateStyle:"medium"})}</time><b>+{r.points.toFixed(1)}</b></div><h4>{r.summary||r.raw_text}</h4>
          <div className="source-why"><b>Why this mattered:</b><p>{explainContribution(statKey,r)}</p></div>
          <div className="source-evidence"><b>What Bubble noticed:</b><p>{r.reasons.join(" · ")}</p></div></article>):<p>No entries have contributed yet.</p>}</div>
  </section></div>
}


function AuthShell({children}){
  return <main className="auth-shell"><div className="auth-brand"><span className="tiny">ALLI'S LIFE LEARNING BUBBLE</span><h1>Bubble 🫧</h1><p>Your private little world, saved safely.</p></div>{children}</main>;
}

function LoginScreen({supabase,message,setMessage}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  async function login(e){
    e.preventDefault(); setBusy(true); setMessage("");
    if(!supabase){ setMessage("Supabase environment variables are missing in Vercel."); setBusy(false); return; }
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error) setMessage(error.message);
    setBusy(false);
  }
  return <AuthShell><form className="auth-card card" onSubmit={login}>
    <p className="soft">WELCOME HOME</p><h2>Sign into Bubble</h2><p>Use the email and password you created in Supabase.</p>
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
    <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>
    <button className="primary" disabled={busy}>{busy?"Opening Bubble…":"Sign in 🫧"}</button>
    {message&&<div className="notice">{message}</div>}
  </form></AuthShell>;
}
