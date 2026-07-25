import { NextResponse } from "next/server";

const categories = ["body","mind","relationships","money","work","fun","growth","creativity","life"];
const DATA_KEYS = [
  "calories","protein_g","water_oz","miles","steps","squats","strength_reps",
  "workout_minutes","strength_minutes","cardio_minutes","mobility_minutes",
  "sleep_hours","sleep_quality","weight_lb","fruit_veg",
  "spending","flights","growth_points","mood","relationship_event","work_stress"
];

function fallback(text) {
  const lower=text.toLowerCase();
  const number=(pattern)=>{const m=lower.match(pattern);return m?Number(m[1]):null};
  const cats=[];
  if(/eat|ate|food|tea|coffee|calor|protein|walk|mile|squat|gym|sleep|water|weight/.test(lower))cats.push("body");
  if(/feel|sad|happy|hurt|grief|stress|proud|confident|mind/.test(lower))cats.push("mind");
  if(/justin|steve|nat|friend|relationship|family/.test(lower))cats.push("relationships");
  if(/work|boss|payroll|job|accounting/.test(lower))cats.push("work");
  if(/spent|bought|paid|\$/.test(lower))cats.push("money");
  if(!cats.length)cats.push("life");
  const data={};
  DATA_KEYS.forEach(k=>data[k]=null);
  data.foods=[];data.exercises=[];data.people=[];data.notes=[text];
  data.squats=number(/(\d+)\s+(?:weighted\s+)?squats?/);
  data.miles=number(/(\d+(?:\.\d+)?)\s+miles?/);
  data.sleep_hours=number(/(?:slept|sleep)\s+(?:about\s+)?(\d+(?:\.\d+)?)\s+hours?/);
  data.weight_lb=number(/(?:weight|weigh)\D{0,10}(\d{2,3}(?:\.\d+)?)/);
  return {summary:text.length>100?text.slice(0,97)+"...":text,encouragement:"You checked in. That counts. 🫧",categories:[...new Set(cats)],data,follow_up_questions:[]};
}

export async function POST(req){
  try{
    const body=await req.json();
    const key=process.env.OPENAI_API_KEY;
    if(!key){
      if(body.mode==="query") return NextResponse.json({answer:"Your history is saved, but history questions will wake up after API credits are added."});
      return NextResponse.json(fallback(body.text||""));
    }
    const model=process.env.OPENAI_MODEL||"gpt-5-mini";
    if(body.mode==="query"){
      const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({
        model,
        instructions:"You are Bubble, Alli's warm personal history companion. Answer only from the provided history. Make uncertainty explicit. Be compassionate but direct. Do not diagnose. Keep answers under 250 words.",
        input:`PROFILE:\n${JSON.stringify(body.profile)}\nQUESTION:\n${body.text}\nHISTORY:\n${JSON.stringify(body.history)}`
      })});
      const j=await r.json(); if(!r.ok) throw new Error(j.error?.message||"OpenAI request failed");
      return NextResponse.json({answer:j.output_text});
    }

    const schema={
      type:"object",additionalProperties:false,
      properties:{
        summary:{type:"string"},encouragement:{type:"string"},
        categories:{type:"array",items:{type:"string",enum:categories}},
        data:{type:"object",additionalProperties:false,properties:{
          calories:{type:["number","null"]},protein_g:{type:["number","null"]},water_oz:{type:["number","null"]},
          miles:{type:["number","null"]},steps:{type:["number","null"]},squats:{type:["number","null"]},
          strength_reps:{type:["number","null"]},workout_minutes:{type:["number","null"]},
          strength_minutes:{type:["number","null"]},cardio_minutes:{type:["number","null"]},
          mobility_minutes:{type:["number","null"]},sleep_hours:{type:["number","null"]},sleep_quality:{type:["number","null"]},weight_lb:{type:["number","null"]},
          fruit_veg:{type:["number","null"]},spending:{type:["number","null"]},flights:{type:["number","null"]},
          growth_points:{type:["number","null"]},mood:{type:["string","null"]},
          relationship_event:{type:["string","null"]},work_stress:{type:["number","null"]},
          foods:{type:"array",items:{type:"string"}},exercises:{type:"array",items:{type:"string"}},
          people:{type:"array",items:{type:"string"}},notes:{type:"array",items:{type:"string"}}
        },required:[...DATA_KEYS,"foods","exercises","people","notes"]},
        follow_up_questions:{type:"array",items:{type:"string"}}
      },required:["summary","encouragement","categories","data","follow_up_questions"]
    };
    const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({
      model,
      instructions:`You are Bubble, Alli's personal life-game engine. Parse casual language with typos. Estimate food calories and protein honestly. Extract explicit workouts, miles, sleep, water, weight, mood, spending, people, and life events. A single update may affect many categories. strength_reps should approximate total resistance or bodyweight reps explicitly stated, without double-counting squats. sleep_quality is 1-5 only when stated or strongly clear. growth_points should be 0-10 for meaningful reflection, courage, boundary-setting, or body-image progress. encouragement must be specific, warm, and under two sentences. follow_up_questions should contain at most two truly useful missing questions, not an interrogation. Never diagnose.`,
      input:body.text||"",
      text:{format:{type:"json_schema",name:"bubble_update",strict:true,schema}}
    })});
    const j=await r.json();if(!r.ok)throw new Error(j.error?.message||"OpenAI request failed");
    return NextResponse.json(JSON.parse(j.output_text));
  }catch(e){return NextResponse.json({error:e.message||"Unexpected error"},{status:500})}
}
