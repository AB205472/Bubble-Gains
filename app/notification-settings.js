"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase";

const STORAGE_KEY = "bubble_notification_settings_v2";
const DEFAULTS = { enabled:false, breakfast:"08:00", lunch:"11:30", snack:"14:45", recap:"19:30" };

function isStandalone(){
  return typeof window!=="undefined" && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true);
}

export default function NotificationSettings(){
  const supabase=useMemo(()=>getSupabaseBrowserClient(),[]);
  const [open,setOpen]=useState(false);
  const [settings,setSettings]=useState(DEFAULTS);
  const [permission,setPermission]=useState("default");
  const [installed,setInstalled]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    setInstalled(isStandalone());
    if("Notification" in window) setPermission(Notification.permission);
    try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");if(saved)setSettings({...DEFAULTS,...saved});}catch{}
  },[]);

  useEffect(()=>{
    if(!supabase) return;
    let cancelled=false;
    (async()=>{
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.user||cancelled)return;
      const {data}=await supabase.from("notification_preferences").select("*").eq("user_id",session.user.id).maybeSingle();
      if(data&&!cancelled){
        const next={enabled:data.enabled,breakfast:data.breakfast_time?.slice(0,5)||DEFAULTS.breakfast,lunch:data.lunch_time?.slice(0,5)||DEFAULTS.lunch,snack:data.snack_time?.slice(0,5)||DEFAULTS.snack,recap:data.recap_time?.slice(0,5)||DEFAULTS.recap};
        setSettings(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
      }
    })();
    return()=>{cancelled=true};
  },[supabase]);

  useEffect(()=>{
    if(!settings.enabled||permission!=="granted")return;
    const tick=async()=>{
      const now=new Date();
      const hhmm=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      const dateKey=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Chicago",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
      const reminders=[
        ["breakfast","Morning protein reminder 💪🏻","Let’s get some protein in and start your day strong."],
        ["lunch","Lunch reminder 🍴","Time for lunch. Your protein-first workday keeps dinner flexible."],
        ["snack","Before you leave work 👜","Grab your high-protein snack before you head out."],
        ["recap","Bubble daily recap ✨","Open Bubble and finish today’s wins, food, water, and movement recap."]
      ];
      for(const [key,title,body] of reminders){
        if(settings[key]!==hhmm)continue;
        const sentKey=`bubble_notice_${dateKey}_${key}`;
        if(localStorage.getItem(sentKey))continue;
        const reg=await navigator.serviceWorker?.ready;
        if(reg)await reg.showNotification(title,{body,icon:"/icon",badge:"/icon",tag:`bubble-${key}`,data:{url:"/"}});
        localStorage.setItem(sentKey,"1");
      }
    };
    tick();const timer=setInterval(tick,30000);return()=>clearInterval(timer);
  },[settings,permission]);

  const save=async next=>{
    setSettings(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
    if(!supabase)return;
    const {data:{session}}=await supabase.auth.getSession();if(!session?.user)return;
    await supabase.from("notification_preferences").upsert({user_id:session.user.id,enabled:next.enabled,breakfast_time:next.breakfast,lunch_time:next.lunch,snack_time:next.snack,recap_time:next.recap,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||"America/Chicago",updated_at:new Date().toISOString()},{onConflict:"user_id"});
  };

  const enable=async()=>{
    if(!installed){setMessage("Add Bubble to your Home Screen first, then open it from the AB icon and tap this bell again.");return;}
    if(!("Notification" in window)){setMessage("Notifications are not supported on this device.");return;}
    const result=permission==="granted"?"granted":await Notification.requestPermission();setPermission(result);
    if(result==="granted"){
      await save({...settings,enabled:true});
      const reg=await navigator.serviceWorker?.ready;
      await reg?.showNotification("Bubble notifications are on 🫧",{body:"Your cute little reminders are ready.",icon:"/icon",badge:"/icon",tag:"bubble-welcome",data:{url:"/"}});
      setMessage("Notifications are on. You should see the test alert now. ♡");
    }else setMessage("Notification permission was not granted. You can enable it in iPhone Settings for Bubble.");
  };

  return <>
    <button className="notification-fab" onClick={()=>setOpen(true)} aria-label="Open Bubble notification settings">🔔</button>
    {open&&<div className="notification-backdrop" onClick={()=>setOpen(false)}>
      <section className="notification-sheet" onClick={e=>e.stopPropagation()} aria-label="Bubble notification settings">
        <div className="notification-head"><div><strong>Bubble reminders</strong><p>Your little workday nudges, exactly when you need them.</p></div><button onClick={()=>setOpen(false)} aria-label="Close">×</button></div>
        <img className="app-icon-preview" src="/icon" alt="Pink AB Bubble app icon"/>
        <p className="bubble-kicker">live life. bubble figures the rest out. ♡</p>
        {!installed&&<><div className="notification-note"><strong>Add Bubble to your iPhone Home Screen</strong><br/>Open this page in Safari, tap Share, choose <b>Add to Home Screen</b>, then launch Bubble from the new pink AB icon.</div><div className="install-steps"><div className="install-step"><b>1</b>Open in Safari</div><div className="install-step"><b>2</b>Share → Add to Home Screen</div><div className="install-step"><b>3</b>Open the AB icon</div></div></>}
        <button className="notification-primary" onClick={enable}>{permission==="granted"?"Send me a test notification ✨":"Turn on notifications ♡"}</button>
        <label>Morning protein<input type="time" value={settings.breakfast} onChange={e=>save({...settings,breakfast:e.target.value})}/></label>
        <label>Lunch<input type="time" value={settings.lunch} onChange={e=>save({...settings,lunch:e.target.value})}/></label>
        <label>Before leaving work<input type="time" value={settings.snack} onChange={e=>save({...settings,snack:e.target.value})}/></label>
        <label>Daily recap<input type="time" value={settings.recap} onChange={e=>save({...settings,recap:e.target.value})}/></label>
        <label className="notification-toggle"><input type="checkbox" checked={settings.enabled} onChange={e=>save({...settings,enabled:e.target.checked})}/> Reminders enabled</label>
        {message&&<p className="notification-message">{message}</p>}
        <p className="notification-foot">Keep Bubble installed on your Home Screen. Your reminder preferences are saved securely to your Bubble account.</p>
      </section>
    </div>}
  </>;
}
