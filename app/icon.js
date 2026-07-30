import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon(){
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:"#fff4f7",fontFamily:"cursive"}}>
      <div style={{position:"absolute",width:430,height:430,borderRadius:"50%",background:"radial-gradient(circle at 30% 20%,#ffffff 0 7%,rgba(255,255,255,.72) 8% 15%,transparent 16%),radial-gradient(circle at 48% 44%,#ffc5dc 0%,#f891bd 58%,#ef6faa 100%)",border:"7px solid #f45f9f",boxShadow:"0 18px 30px rgba(187,75,127,.25),inset 0 0 34px rgba(255,255,255,.8)"}} />
      <div style={{position:"absolute",left:78,top:66,width:170,height:58,borderRadius:"50%",background:"rgba(255,255,255,.72)",transform:"rotate(-24deg)",filter:"blur(1px)"}} />
      <div style={{position:"absolute",right:82,bottom:92,width:115,height:34,borderRadius:"50%",background:"rgba(255,255,255,.65)",transform:"rotate(-20deg)"}} />
      <div style={{position:"absolute",left:92,top:102,color:"white",fontSize:38}}>✦</div>
      <div style={{position:"absolute",right:98,top:130,color:"white",fontSize:28}}>✧</div>
      <div style={{position:"absolute",left:105,bottom:120,color:"white",fontSize:24}}>✧</div>
      <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",marginTop:-6,color:"#fff8fb",fontSize:185,fontWeight:500,letterSpacing:-24,textShadow:"0 5px 0 #dc4f8f,0 0 9px white"}}>AB</div>
      <div style={{position:"absolute",right:104,bottom:115,color:"#fff",fontSize:65,textShadow:"0 4px 0 #dc4f8f"}}>♡</div>
    </div>,
    size
  );
}
