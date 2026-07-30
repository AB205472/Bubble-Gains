"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bubble_notification_settings_v1";
const DEFAULTS = {
  enabled: false,
  breakfast: "08:00",
  lunch: "11:30",
  snack: "14:45",
  recap: "19:30"
};

function isStandalone(){
  return typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
}

export default function NotificationSettings(){
  const [open,setOpen]=useState(false);
  const [settings,setSettings]=useState(DEFAULTS);
  const [permission,setPermission]=useState("default");
  const [installed,setInstalled]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    setInstalled(isStandalone());
    if("Notification" in window) setPermission(Notification.permission);
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(saved) setSettings({...DEFAULTS,...saved});
    }catch{}
  },[]);

  useEffect(()=>{
    if(!settings.enabled || permission!=="granted") return;
    const tick=async()=>{
      const now=new Date();
      const hhmm=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      const dateKey=now.toISOString().slice(0,10);
      const reminders=[
        ["breakfast","Protein check 💪🏻","Start the workday with protein and water."],
        ["lunch","Lunch check","Your protein-first lunch keeps dinner flexible."],
        ["snack","Before you leave work","Grab your protein snack now so you do not leave starving."],
        ["recap","Bubble daily recap","Open Bubble and finish today’s check-in."]
      ];
      for(const [key,title,body] of reminders){
        if(settings[key]!==hhmm) continue;
        const sentKey=`bubble_notice_${dateKey}_${key}`;
        if(localStorage.getItem(sentKey)) continue;
        const reg=await navigator.serviceWorker?.ready;
        if(reg) await reg.showNotification(title,{body,icon:"/icon-192.png",badge:"/icon-192.png",tag:`bubble-${key}`,data:{url:"/"}});
        localStorage.setItem(sentKey,"1");
      }
    };
    tick();
    const timer=setInterval(tick,30000);
    return()=>clearInterval(timer);
  },[settings,permission]);

  const save=next=>{
    setSettings(next);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
  };

  const enable=async()=>{
    if(!("Notification" in window)){setMessage("Notifications are not supported in this browser.");return;}
    const result=await Notification.requestPermission();
    setPermission(result);
    if(result==="granted"){
      save({...settings,enabled:true});
      const reg=await navigator.serviceWorker?.ready;
      await reg?.showNotification("Bubble notifications are on 🫧",{body:"Your workday reminders are ready.",icon:"/icon-192.png",tag:"bubble-welcome",data:{url:"/"}});
      setMessage("Notifications are on.");
    }else setMessage("Notification permission was not granted.");
  };

  return <>
    <button className="notification-fab" onClick={()=>setOpen(true)} aria-label="Notification settings">🔔</button>
    {open&&<div className="notification-backdrop" onClick={()=>setOpen(false)}>
      <section className="notification-sheet" onClick={e=>e.stopPropagation()} aria-label="Bubble notification settings">
        <div className="notification-head"><div><strong>Bubble reminders</strong><p>Protein, lunch, before-leaving-work, and daily recap nudges.</p></div><button onClick={()=>setOpen(false)} aria-label="Close">×</button></div>
        {!installed&&<div className="notification-note"><strong>Install Bubble first on iPhone:</strong> Safari → Share → Add to Home Screen. Then open Bubble from the new icon.</div>}
        <button className="notification-primary" onClick={enable}>{permission==="granted"?"Send test notification":"Turn on notifications"}</button>
        <label>Morning protein<input type="time" value={settings.breakfast} onChange={e=>save({...settings,breakfast:e.target.value})}/></label>
        <label>Lunch<input type="time" value={settings.lunch} onChange={e=>save({...settings,lunch:e.target.value})}/></label>
        <label>Before leaving work<input type="time" value={settings.snack} onChange={e=>save({...settings,snack:e.target.value})}/></label>
        <label>Daily recap<input type="time" value={settings.recap} onChange={e=>save({...settings,recap:e.target.value})}/></label>
        <label className="notification-toggle"><input type="checkbox" checked={settings.enabled} onChange={e=>save({...settings,enabled:e.target.checked})}/> Reminders enabled</label>
        {message&&<p className="notification-message">{message}</p>}
        <p className="notification-foot">These reminders run from the installed Bubble app. Remote push support is wired into the service worker for the next server-scheduling step.</p>
      </section>
    </div>}
  </>;
}
