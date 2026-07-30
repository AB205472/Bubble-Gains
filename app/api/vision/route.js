import { NextResponse } from "next/server";
import { parseStructuredResponse, readJsonResponse } from "../../../lib/server/openai-response";

export const runtime = "nodejs";

const nullableNumber = { type:["number","null"] };
const nullableString = { type:["string","null"] };
const categories = ["body","mind","relationships","money","work","fun","growth","creativity","life"];

const schema = {
  type:"object",
  additionalProperties:false,
  properties:{
    reply:{type:"string"},
    attachment_type:{type:"string",enum:["meal","receipt","scale","workout","progress","general"]},
    should_log:{type:"boolean"},
    save_label:{type:"string"},
    summary:{type:"string"},
    encouragement:{type:"string"},
    categories:{type:"array",items:{type:"string",enum:categories}},
    data:{
      type:"object",
      additionalProperties:false,
      properties:{
        calories:nullableNumber,protein_g:nullableNumber,carbs_g:nullableNumber,fat_g:nullableNumber,
        added_sugar_g:nullableNumber,caffeine_mg:nullableNumber,
        nutrition_confidence:{type:["string","null"],enum:["high","medium","low",null]},
        water_oz:nullableNumber,miles:nullableNumber,steps:nullableNumber,squats:nullableNumber,
        strength_reps:nullableNumber,workout_minutes:nullableNumber,strength_minutes:nullableNumber,
        cardio_minutes:nullableNumber,mobility_minutes:nullableNumber,sleep_hours:nullableNumber,
        sleep_quality:nullableNumber,weight_lb:nullableNumber,fruit_veg:nullableNumber,
        spending:nullableNumber,flights:nullableNumber,growth_points:nullableNumber,
        mood:nullableString,relationship_event:nullableString,work_stress:nullableNumber,
        foods:{type:"array",items:{type:"string"}},exercises:{type:"array",items:{type:"string"}},
        people:{type:"array",items:{type:"string"}},notes:{type:"array",items:{type:"string"}},
        lessons:{type:"array",items:{type:"string"}},facts_learned:{type:"array",items:{type:"string"}},
        patterns_noticed:{type:"array",items:{type:"string"}},coping_actions:{type:"array",items:{type:"string"}},
        boundaries:{type:"array",items:{type:"string"}},recovery_actions:{type:"array",items:{type:"string"}},
        connection_actions:{type:"array",items:{type:"string"}},creative_actions:{type:"array",items:{type:"string"}},
        money_actions:{type:"array",items:{type:"string"}},milestones:{type:"array",items:{type:"string"}}
      },
      required:["calories","protein_g","carbs_g","fat_g","added_sugar_g","caffeine_mg","nutrition_confidence","water_oz","miles","steps","squats","strength_reps","workout_minutes","strength_minutes","cardio_minutes","mobility_minutes","sleep_hours","sleep_quality","weight_lb","fruit_veg","spending","flights","growth_points","mood","relationship_event","work_stress","foods","exercises","people","notes","lessons","facts_learned","patterns_noticed","coping_actions","boundaries","recovery_actions","connection_actions","creative_actions","money_actions","milestones"]
    }
  },
  required:["reply","attachment_type","should_log","save_label","summary","encouragement","categories","data"]
};

export async function POST(req){
  try{
    const body = await req.json();
    const imageUrl = String(body.imageUrl || "").trim();
    const text = String(body.text || "").trim();
    if(!imageUrl) return NextResponse.json({error:"Image URL is required."},{status:400});
    if(!process.env.OPENAI_API_KEY) return NextResponse.json({error:"OpenAI is not configured."},{status:503});

    const response = await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL || "gpt-5-mini",
        instructions:`You are Bubble, Alli's trusted AI life companion. Analyze the attached image carefully and reply naturally, warmly, and directly. Classify it as meal, receipt, scale, workout, progress, or general. Extract useful structured data only when visible or reasonably inferable. For food, estimate calories and macros honestly and label confidence. For receipts, identify purchased food and spending when readable. For scale photos, read weight only when visible. For workout screens, extract visible workout metrics. For progress photos, do not judge attractiveness, weight, body shape, or health; only acknowledge that the image can be stored as a timeline record. Never pretend uncertain details are exact. The reply should describe what you can see and clearly distinguish estimates.`,
        input:[{role:"user",content:[
          {type:"input_text",text:text || "Please analyze this image for Bubble."},
          {type:"input_image",image_url:imageUrl,detail:"high"}
        ]}],
        text:{format:{type:"json_schema",name:"bubble_vision_reply",strict:true,schema}}
      })
    });
    const json = await readJsonResponse(response);
    if(!response.ok) throw new Error(json.error?.message || `OpenAI request failed (${response.status})`);
    return NextResponse.json(parseStructuredResponse(json));
  }catch(error){
    console.error("Bubble vision route failed:",error);
    return NextResponse.json({error:error.message || "Bubble could not analyze that image."},{status:500});
  }
}
