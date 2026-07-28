import { NextResponse } from "next/server";

const categories = ["body","mind","relationships","money","work","fun","growth","creativity","life"];
const nullableNumber = {type:["number","null"]};
const nullableString = {type:["string","null"]};

const updateSchema = {
  type:"object",
  additionalProperties:false,
  properties:{
    reply:{type:"string"},
    should_log:{type:"boolean"},
    summary:{type:"string"},
    encouragement:{type:"string"},
    categories:{type:"array",items:{type:"string",enum:categories}},
    data:{
      type:"object",
      additionalProperties:false,
      properties:{
        calories:nullableNumber, protein_g:nullableNumber, carbs_g:nullableNumber, fat_g:nullableNumber,
        added_sugar_g:nullableNumber, caffeine_mg:nullableNumber,
        nutrition_confidence:{type:["string","null"],enum:["high","medium","low",null]},
        water_oz:nullableNumber, miles:nullableNumber, steps:nullableNumber, squats:nullableNumber,
        strength_reps:nullableNumber, workout_minutes:nullableNumber, strength_minutes:nullableNumber,
        cardio_minutes:nullableNumber, mobility_minutes:nullableNumber, sleep_hours:nullableNumber,
        sleep_quality:nullableNumber, weight_lb:nullableNumber, fruit_veg:nullableNumber,
        spending:nullableNumber, flights:nullableNumber, growth_points:nullableNumber,
        mood:nullableString, relationship_event:nullableString, work_stress:nullableNumber,
        foods:{type:"array",items:{type:"string"}}, exercises:{type:"array",items:{type:"string"}},
        people:{type:"array",items:{type:"string"}}, notes:{type:"array",items:{type:"string"}},
        lessons:{type:"array",items:{type:"string"}}, facts_learned:{type:"array",items:{type:"string"}},
        patterns_noticed:{type:"array",items:{type:"string"}}, coping_actions:{type:"array",items:{type:"string"}},
        boundaries:{type:"array",items:{type:"string"}}, recovery_actions:{type:"array",items:{type:"string"}},
        connection_actions:{type:"array",items:{type:"string"}}, creative_actions:{type:"array",items:{type:"string"}},
        money_actions:{type:"array",items:{type:"string"}}, milestones:{type:"array",items:{type:"string"}}
      },
      required:["calories","protein_g","carbs_g","fat_g","added_sugar_g","caffeine_mg","nutrition_confidence","water_oz","miles","steps","squats","strength_reps","workout_minutes","strength_minutes","cardio_minutes","mobility_minutes","sleep_hours","sleep_quality","weight_lb","fruit_veg","spending","flights","growth_points","mood","relationship_event","work_stress","foods","exercises","people","notes","lessons","facts_learned","patterns_noticed","coping_actions","boundaries","recovery_actions","connection_actions","creative_actions","money_actions","milestones"]
    }
  },
  required:["reply","should_log","summary","encouragement","categories","data"]
};

function fallback(text){
  return {
    reply:"I’m here, and I saved what you said. The advice side of Bubble will wake up as soon as your OpenAI key and credits are active. 🫧",
    should_log:true,
    summary:text.slice(0,120), encouragement:"You checked in. That counts. 🫧", categories:["life"],
    data:{calories:null,protein_g:null,carbs_g:null,fat_g:null,added_sugar_g:null,caffeine_mg:null,nutrition_confidence:null,water_oz:null,miles:null,steps:null,squats:null,strength_reps:null,workout_minutes:null,strength_minutes:null,cardio_minutes:null,mobility_minutes:null,sleep_hours:null,sleep_quality:null,weight_lb:null,fruit_veg:null,spending:null,flights:null,growth_points:null,mood:null,relationship_event:null,work_stress:null,foods:[],exercises:[],people:[],notes:[text],lessons:[],facts_learned:[],patterns_noticed:[],coping_actions:[],boundaries:[],recovery_actions:[],connection_actions:[],creative_actions:[],money_actions:[],milestones:[]}
  };
}

export async function POST(req){
  try{
    const body = await req.json();
    const text = String(body.text || "").trim();
    if(!text) return NextResponse.json({error:"Message is empty."},{status:400});
    const key = process.env.OPENAI_API_KEY;
    if(!key) return NextResponse.json(fallback(text));

    const recentChat = Array.isArray(body.todayMessages) ? body.todayMessages.slice(-24) : [];
    const memories = Array.isArray(body.memories) ? body.memories.slice(0,90) : [];
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";
    const instructions = `You are Bubble, Alli's trusted daily AI companion and life-learning system. Speak naturally, warmly, directly, and conversationally—like a close friend who knows her well, not a clinical app. Match her casual language without forcing slang. Give real advice when advice is useful. Validate feelings without blindly agreeing, gently challenge fear-driven assumptions, and center her stated values: connection, honesty, mutual emotional closeness, peace, self-respect, and choosing values over fear. Ask at most one useful follow-up question. Do not diagnose. Do not encourage dependence on Bubble or imply you replace human support. When immediate danger, abuse, self-harm, severe medical symptoms, or another urgent safety issue appears, prioritize safety and appropriate real-world help.

At the same time, quietly extract anything that should affect today's Bubble stats. Estimate calories and macros honestly from food descriptions. High confidence requires a label, exact branded item, or official restaurant item; medium is a reasonably described meal; low is vague. Never pretend estimates are exact. should_log=false only for messages with no meaningful personal, health, event, feeling, decision, or life information. The reply must answer the user first; never sound like a logging confirmation. Keep most replies under 350 words unless the situation genuinely needs more.`;

    const response = await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        model,
        instructions,
        input:`TODAY (${body.entryDate || "current day"})\n${JSON.stringify(recentChat)}\n\nLONG-TERM BUBBLE MEMORY\n${JSON.stringify(memories)}\n\nPROFILE\n${JSON.stringify(body.profile || {})}\n\nALLI'S NEW MESSAGE\n${text}`,
        text:{format:{type:"json_schema",name:"bubble_chat_reply",strict:true,schema:updateSchema}}
      })
    });
    const json = await response.json();
    if(!response.ok) throw new Error(json.error?.message || "OpenAI request failed");
    return NextResponse.json(JSON.parse(json.output_text));
  }catch(error){
    return NextResponse.json({error:error.message || "Bubble could not answer."},{status:500});
  }
}
