"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSupabaseBrowserClient } from "../lib/supabase";
import { centralDateKey } from "../lib/game";

const ACCEPTED = ["image/jpeg","image/png","image/webp","image/heic","image/heif"];
const MAX_SIZE = 15 * 1024 * 1024;

function safeName(name="image"){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"") || "image";
}

export default function BubbleVision(){
  const supabase = useMemo(()=>getSupabaseBrowserClient(),[]);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [mounted,setMounted] = useState(false);
  const [composer,setComposer] = useState(null);
  const [preview,setPreview] = useState(null);
  const [file,setFile] = useState(null);
  const [caption,setCaption] = useState("");
  const [busy,setBusy] = useState(false);
  const [status,setStatus] = useState("");

  useEffect(()=>setMounted(true),[]);
  useEffect(()=>{
    const locate=()=>setComposer(document.querySelector(".chat-composer"));
    locate();
    const observer=new MutationObserver(locate);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);

  function choose(nextFile){
    if(!nextFile) return;
    if(!ACCEPTED.includes(nextFile.type)){ setStatus("Use a JPG, PNG, WebP, HEIC, or HEIF image."); return; }
    if(nextFile.size > MAX_SIZE){ setStatus("That image is over 15 MB."); return; }
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setStatus("");
  }

  function close(){
    if(preview) URL.revokeObjectURL(preview);
    setPreview(null);setFile(null);setCaption("");setStatus("");
  }

  async function send(){
    if(!file || busy || !supabase) return;
    setBusy(true);setStatus("Uploading privately…");
    try{
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.user) throw new Error("Please sign in again.");
      const entryDate=centralDateKey();
      const {data:chatDay,error:dayError}=await supabase.from("bubble_chat_days")
        .upsert({user_id:session.user.id,entry_date:entryDate,status:"open",title:"Today with Bubble",updated_at:new Date().toISOString()},{onConflict:"user_id,entry_date"})
        .select("*").single();
      if(dayError) throw dayError;

      const path=`${session.user.id}/${entryDate}/${crypto.randomUUID()}-${safeName(file.name)}`;
      const {error:uploadError}=await supabase.storage.from("bubble-uploads").upload(path,file,{contentType:file.type,upsert:false});
      if(uploadError) throw uploadError;

      const content=caption.trim() || "Shared a photo with Bubble.";
      const {data:userMessage,error:messageError}=await supabase.from("bubble_chat_messages").insert({
        chat_day_id:chatDay.id,user_id:session.user.id,entry_date:entryDate,role:"user",content,
        metadata:{has_attachments:true,attachment_count:1}
      }).select("*").single();
      if(messageError) throw messageError;

      const {data:attachment,error:attachmentError}=await supabase.from("bubble_attachments").insert({
        user_id:session.user.id,chat_day_id:chatDay.id,message_id:userMessage.id,entry_date:entryDate,
        storage_path:path,file_name:file.name,mime_type:file.type,size_bytes:file.size,status:"uploaded"
      }).select("*").single();
      if(attachmentError) throw attachmentError;

      const {data:signed,error:signedError}=await supabase.storage.from("bubble-uploads").createSignedUrl(path,300);
      if(signedError) throw signedError;
      setStatus("Bubble is looking at it…");
      const response=await fetch("/api/vision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageUrl:signed.signedUrl,text:caption.trim(),entryDate})});
      const parsed=await response.json();
      if(!response.ok) throw new Error(parsed.error || "Bubble could not analyze that image.");

      const {data:assistantMessage,error:assistantError}=await supabase.from("bubble_chat_messages").insert({
        chat_day_id:chatDay.id,user_id:session.user.id,entry_date:entryDate,role:"assistant",content:parsed.reply,
        metadata:{vision:true,attachment_id:attachment.id,attachment_type:parsed.attachment_type,save_candidate:parsed.should_log,save_label:parsed.save_label,structured_data:parsed.data,categories:parsed.categories || []}
      }).select("*").single();
      if(assistantError) throw assistantError;

      await supabase.from("bubble_attachments").update({status:"analyzed",attachment_type:parsed.attachment_type,analysis:parsed,updated_at:new Date().toISOString()}).eq("id",attachment.id);
      await supabase.from("bubble_chat_days").update({updated_at:new Date().toISOString()}).eq("id",chatDay.id);
      close();
      window.location.reload();
    }catch(error){
      setStatus(error.message || "Upload failed.");
    }finally{setBusy(false);}
  }

  if(!mounted || !composer) return null;
  return createPortal(<>
    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
      <button type="button" onClick={()=>cameraRef.current?.click()} aria-label="Take a photo" style={toolStyle}>📷 <span>Camera</span></button>
      <button type="button" onClick={()=>fileRef.current?.click()} aria-label="Choose a photo" style={toolStyle}>🖼️ <span>Photos</span></button>
      <button type="button" disabled title="Voice is coming next" style={{...toolStyle,opacity:.55}}>🎤 <span>Voice soon</span></button>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={e=>choose(e.target.files?.[0])}/>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden onChange={e=>choose(e.target.files?.[0])}/>
    </div>
    {preview && <div role="dialog" aria-modal="true" style={backdropStyle} onClick={close}>
      <section style={modalStyle} onClick={e=>e.stopPropagation()}>
        <button type="button" onClick={close} aria-label="Close" style={closeStyle}>×</button>
        <p style={{fontSize:12,fontWeight:800,letterSpacing:1,color:"#756b91",margin:"0 0 8px"}}>BUBBLE VISION</p>
        <h3 style={{margin:"0 0 12px"}}>Send this to Bubble?</h3>
        <img src={preview} alt="Selected upload preview" style={{width:"100%",maxHeight:"48vh",objectFit:"contain",borderRadius:18,background:"#f5f1ff"}}/>
        <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Optional: tell Bubble anything about this photo…" style={captionStyle}/>
        {status && <p style={{margin:"8px 0",fontSize:14}}>{status}</p>}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
          <button type="button" onClick={close} disabled={busy} style={secondaryStyle}>Cancel</button>
          <button type="button" onClick={send} disabled={busy} style={primaryStyle}>{busy?"Working…":"Send to Bubble 🫧"}</button>
        </div>
      </section>
    </div>}
  </>,composer);
}

const toolStyle={border:"1px solid rgba(117,107,145,.22)",background:"rgba(255,255,255,.78)",borderRadius:999,padding:"8px 12px",display:"inline-flex",gap:6,alignItems:"center",fontWeight:700,cursor:"pointer"};
const backdropStyle={position:"fixed",inset:0,zIndex:9999,background:"rgba(34,27,50,.58)",display:"grid",placeItems:"center",padding:18};
const modalStyle={position:"relative",width:"min(540px,100%)",maxHeight:"92vh",overflow:"auto",background:"white",borderRadius:26,padding:20,boxShadow:"0 24px 80px rgba(0,0,0,.28)"};
const closeStyle={position:"absolute",right:14,top:12,border:0,background:"transparent",fontSize:28,cursor:"pointer"};
const captionStyle={width:"100%",minHeight:82,marginTop:14,border:"1px solid #ded8ee",borderRadius:16,padding:12,font:"inherit",resize:"vertical",boxSizing:"border-box"};
const primaryStyle={border:0,borderRadius:999,padding:"11px 16px",fontWeight:800,background:"#6f5ea8",color:"white",cursor:"pointer"};
const secondaryStyle={border:"1px solid #d8d0eb",borderRadius:999,padding:"11px 16px",fontWeight:800,background:"white",cursor:"pointer"};
