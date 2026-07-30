"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSupabaseBrowserClient } from "../lib/supabase";
import { centralDateKey } from "../lib/game";

const ACCEPTED=["image/jpeg","image/png","image/webp","image/heic","image/heif"];
const MAX_SIZE=15*1024*1024;
const safeName=(name="image")=>name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"")||"image";

export default function BubbleVision(){
  const supabase=useMemo(()=>getSupabaseBrowserClient(),[]);
  const fileRef=useRef(null),cameraRef=useRef(null);
  const [mounted,setMounted]=useState(false),[composer,setComposer]=useState(null);
  const [preview,setPreview]=useState(null),[file,setFile]=useState(null),[caption,setCaption]=useState("");
  const [busy,setBusy]=useState(false),[status,setStatus]=useState(""),[cards,setCards]=useState([]),[savingId,setSavingId]=useState(null);

  useEffect(()=>setMounted(true),[]);
  useEffect(()=>{
    const locate=()=>setComposer(document.querySelector(".chat-composer"));
    locate();const observer=new MutationObserver(locate);observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    if(!composer||!supabase) return;
    let cancelled=false;
    async function load(){
      const {data:{session}}=await supabase.auth.getSession();if(!session?.user||cancelled)return;
      const date=centralDateKey();
      const {data:messages}=await supabase.from("bubble_chat_messages").select("*").eq("user_id",session.user.id).eq("entry_date",date).order("created_at",{ascending:true});
      const vision=(messages||[]).filter(m=>m.metadata?.vision&&m.metadata?.attachment_id);
      if(!vision.length){setCards([]);return;}
      const ids=vision.map(m=>m.metadata.attachment_id);
      const {data:attachments}=await supabase.from("bubble_attachments").select("*").in("id",ids);
      const built=[];
      for(const message of vision){
        const attachment=(attachments||[]).find(a=>a.id===message.metadata.attachment_id);if(!attachment)continue;
        const {data:signed}=await supabase.storage.from("bubble-uploads").createSignedUrl(attachment.storage_path,3600);
        built.push({message,attachment,url:signed?.signedUrl||null});
      }
      if(!cancelled)setCards(built);
    }
    load();return()=>{cancelled=true};
  },[composer,supabase]);

  function choose(nextFile){
    if(!nextFile)return;
    if(!ACCEPTED.includes(nextFile.type)){setStatus("Use a JPG, PNG, WebP, HEIC, or HEIF image.");return;}
    if(nextFile.size>MAX_SIZE){setStatus("That image is over 15 MB.");return;}
    setFile(nextFile);setPreview(URL.createObjectURL(nextFile));setStatus("");
  }
  function close(){if(preview)URL.revokeObjectURL(preview);setPreview(null);setFile(null);setCaption("");setStatus("");}

  async function send(){
    if(!file||busy||!supabase)return;setBusy(true);setStatus("Uploading privately…");
    try{
      const {data:{session}}=await supabase.auth.getSession();if(!session?.user)throw new Error("Please sign in again.");
      const entryDate=centralDateKey();
      const {data:chatDay,error:dayError}=await supabase.from("bubble_chat_days").upsert({user_id:session.user.id,entry_date:entryDate,status:"open",title:"Today with Bubble",updated_at:new Date().toISOString()},{onConflict:"user_id,entry_date"}).select("*").single();
      if(dayError)throw dayError;
      const path=`${session.user.id}/${entryDate}/${crypto.randomUUID()}-${safeName(file.name)}`;
      const {error:uploadError}=await supabase.storage.from("bubble-uploads").upload(path,file,{contentType:file.type,upsert:false});if(uploadError)throw uploadError;
      const content=caption.trim()||"Shared a photo with Bubble.";
      const {data:userMessage,error:messageError}=await supabase.from("bubble_chat_messages").insert({chat_day_id:chatDay.id,user_id:session.user.id,entry_date:entryDate,role:"user",content,metadata:{has_attachments:true,attachment_count:1}}).select("*").single();if(messageError)throw messageError;
      const {data:attachment,error:attachmentError}=await supabase.from("bubble_attachments").insert({user_id:session.user.id,chat_day_id:chatDay.id,message_id:userMessage.id,entry_date:entryDate,storage_path:path,file_name:file.name,mime_type:file.type,size_bytes:file.size,status:"uploaded"}).select("*").single();if(attachmentError)throw attachmentError;
      const {data:signed,error:signedError}=await supabase.storage.from("bubble-uploads").createSignedUrl(path,300);if(signedError)throw signedError;
      setStatus("Bubble is looking at it…");
      const response=await fetch("/api/vision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageUrl:signed.signedUrl,text:caption.trim(),entryDate})});
      const parsed=await response.json();if(!response.ok)throw new Error(parsed.error||"Bubble could not analyze that image.");
      const {error:assistantError}=await supabase.from("bubble_chat_messages").insert({chat_day_id:chatDay.id,user_id:session.user.id,entry_date:entryDate,role:"assistant",content:parsed.reply,metadata:{vision:true,attachment_id:attachment.id,attachment_type:parsed.attachment_type,save_candidate:parsed.should_log,save_label:parsed.save_label,structured_data:parsed.data,categories:parsed.categories||[],summary:parsed.summary,encouragement:parsed.encouragement,saved:false}});if(assistantError)throw assistantError;
      await supabase.from("bubble_attachments").update({status:"analyzed",attachment_type:parsed.attachment_type,analysis:parsed,updated_at:new Date().toISOString()}).eq("id",attachment.id);
      await supabase.from("bubble_chat_days").update({updated_at:new Date().toISOString()}).eq("id",chatDay.id);
      close();window.location.reload();
    }catch(error){setStatus(error.message||"Upload failed.");}finally{setBusy(false);}
  }

  async function saveCard(card){
    if(!supabase||savingId)return;setSavingId(card.message.id);
    try{
      const {data:{session}}=await supabase.auth.getSession();if(!session?.user)throw new Error("Please sign in again.");
      const meta=card.message.metadata||{},data=meta.structured_data||{};
      const id=crypto.randomUUID(),now=new Date().toISOString(),summary=meta.summary||meta.save_label||"Photo update";
      const record={id,created_at:now,raw_text:card.message.content,summary,encouragement:meta.encouragement||"You made it easy for Bubble to remember this. 🫧",categories:meta.categories||["life"],data:{...data,attachment_id:card.attachment.id,attachment_type:meta.attachment_type}};
      const {error}=await supabase.from("memories").insert({id,user_id:session.user.id,happened_on:centralDateKey(),title:summary,story:record.raw_text,encouragement:record.encouragement,categories:record.categories,people:data.people||[],stat_awards:record.data,raw_entry:record,source:"vision",is_private:true});if(error)throw error;
      await supabase.from("bubble_chat_messages").update({metadata:{...meta,saved:true,memory_id:id}}).eq("id",card.message.id);
      setCards(prev=>prev.map(x=>x.message.id===card.message.id?{...x,message:{...x.message,metadata:{...meta,saved:true,memory_id:id}}}:x));
    }catch(error){alert("Bubble could not save that yet: "+error.message);}finally{setSavingId(null);}
  }

  if(!mounted||!composer)return null;
  return createPortal(<>
    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
      <button type="button" onClick={()=>cameraRef.current?.click()} style={toolStyle}>📷 <span>Camera</span></button>
      <button type="button" onClick={()=>fileRef.current?.click()} style={toolStyle}>🖼️ <span>Photos</span></button>
      <button type="button" disabled title="Voice is coming next" style={{...toolStyle,opacity:.55}}>🎤 <span>Voice soon</span></button>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={e=>choose(e.target.files?.[0])}/>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden onChange={e=>choose(e.target.files?.[0])}/>
    </div>
    {!!cards.length&&<div style={{display:"grid",gap:10,marginBottom:12}}>{cards.map(card=><section key={card.message.id} style={cardStyle}>
      {card.url&&<img src={card.url} alt="Bubble upload" style={{width:72,height:72,objectFit:"cover",borderRadius:14}}/>}
      <div style={{minWidth:0,flex:1}}><small style={{fontWeight:800,textTransform:"uppercase",letterSpacing:.7}}>{card.message.metadata?.attachment_type||"image"}</small><p style={{margin:"4px 0",fontSize:14}}>{card.message.content}</p>
      {card.message.metadata?.save_candidate&&(card.message.metadata?.saved?<span style={savedStyle}>✓ Saved to Bubble</span>:<button type="button" onClick={()=>saveCard(card)} disabled={savingId===card.message.id} style={saveStyle}>{savingId===card.message.id?"Saving…":"💾 Save to Bubble"}</button>)}</div>
    </section>)}</div>}
    {preview&&<div role="dialog" aria-modal="true" style={backdropStyle} onClick={close}><section style={modalStyle} onClick={e=>e.stopPropagation()}>
      <button type="button" onClick={close} style={closeStyle}>×</button><p style={{fontSize:12,fontWeight:800,letterSpacing:1,color:"#756b91",margin:"0 0 8px"}}>BUBBLE VISION</p><h3 style={{margin:"0 0 12px"}}>Send this to Bubble?</h3>
      <img src={preview} alt="Selected upload preview" style={{width:"100%",maxHeight:"48vh",objectFit:"contain",borderRadius:18,background:"#f5f1ff"}}/>
      <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Optional: tell Bubble anything about this photo…" style={captionStyle}/>{status&&<p style={{margin:"8px 0",fontSize:14}}>{status}</p>}
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}><button type="button" onClick={close} disabled={busy} style={secondaryStyle}>Cancel</button><button type="button" onClick={send} disabled={busy} style={primaryStyle}>{busy?"Working…":"Send to Bubble 🫧"}</button></div>
    </section></div>}
  </>,composer);
}

const toolStyle={border:"1px solid rgba(117,107,145,.22)",background:"rgba(255,255,255,.78)",borderRadius:999,padding:"8px 12px",display:"inline-flex",gap:6,alignItems:"center",fontWeight:700,cursor:"pointer"};
const cardStyle={display:"flex",gap:10,alignItems:"center",padding:10,border:"1px solid #e5def4",background:"rgba(247,244,255,.9)",borderRadius:18};
const saveStyle={border:0,borderRadius:999,padding:"8px 12px",fontWeight:800,background:"#6f5ea8",color:"white",cursor:"pointer"};
const savedStyle={display:"inline-block",borderRadius:999,padding:"7px 10px",fontWeight:800,background:"#e8f7ef",color:"#2d7651",fontSize:13};
const backdropStyle={position:"fixed",inset:0,zIndex:9999,background:"rgba(34,27,50,.58)",display:"grid",placeItems:"center",padding:18};
const modalStyle={position:"relative",width:"min(540px,100%)",maxHeight:"92vh",overflow:"auto",background:"white",borderRadius:26,padding:20,boxShadow:"0 24px 80px rgba(0,0,0,.28)"};
const closeStyle={position:"absolute",right:14,top:12,border:0,background:"transparent",fontSize:28,cursor:"pointer"};
const captionStyle={width:"100%",minHeight:82,marginTop:14,border:"1px solid #ded8ee",borderRadius:16,padding:12,font:"inherit",resize:"vertical",boxSizing:"border-box"};
const primaryStyle={border:0,borderRadius:999,padding:"11px 16px",fontWeight:800,background:"#6f5ea8",color:"white",cursor:"pointer"};
const secondaryStyle={border:"1px solid #d8d0eb",borderRadius:999,padding:"11px 16px",fontWeight:800,background:"white",cursor:"pointer"};
