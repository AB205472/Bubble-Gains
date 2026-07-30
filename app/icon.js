import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const Sparkle=({left,top,size=22})=><div style={{position:"absolute",left,top,width:size,height:size,transform:"rotate(45deg)",background:"white",borderRadius:4,boxShadow:"0 0 10px rgba(255,255,255,.9)"}}/>;

export default function Icon(){
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:"#fff4f7",fontFamily:"Arial"}}>
      <div style={{position:"absolute",width:430,height:430,borderRadius:"50%",background:"radial-gradient(circle at 30% 20%,#ffffff 0 7%,rgba(255,255,255,.72) 8% 15%,transparent 16%),radial-gradient(circle at 48% 44%,#ffc5dc 0%,#f891bd 58%,#ef6faa 100%)",border:"7px solid #f45f9f",boxShadow:"0 18px 30px rgba(187,75,127,.25),inset 0 0 34px rgba(255,255,255,.8)"}} />
      <div style={{position:"absolute",left:78,top:66,width:170,height:58,borderRadius:"50%",background:"rgba(255,255,255,.72)",transform:"rotate(-24deg)"}} />
      <div style={{position:"absolute",right:82,bottom:92,width:115,height:34,borderRadius:"50%",background:"rgba(255,255,255,.65)",transform:"rotate(-20deg)"}} />
      <Sparkle left={96} top={112} size={20}/><Sparkle left={382} top={138} size={14}/><Sparkle left={112} top={370} size={12}/>
      <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",marginTop:-6,color:"#fff8fb",fontSize:180,fontWeight:500,letterSpacing:-18,fontStyle:"italic",textShadow:"0 5px 0 #dc4f8f,0 0 9px white"}}>AB</div>
      <div style={{position:"absolute",right:105,bottom:118,width:48,height:42,transform:"rotate(-45deg)",background:"white",borderRadius:"26px 26px 8px 26px",boxShadow:"0 4px 0 #dc4f8f"}} />
    </div>,
    size
  );
}
