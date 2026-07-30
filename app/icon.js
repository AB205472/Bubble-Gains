import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const Dot=({left,top,size=12,color="#f6efe0"})=><div style={{position:"absolute",left,top,width:size,height:size,borderRadius:"50%",background:color,boxShadow:"0 0 12px rgba(255,248,222,.7)"}}/>;

export default function Icon(){
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:"linear-gradient(145deg,#f3ead8,#dfe8d6)",fontFamily:"Georgia"}}>
      <div style={{position:"absolute",inset:24,borderRadius:118,background:"linear-gradient(145deg,#657b58,#3f5541)",border:"8px solid #f8f1df",boxShadow:"0 22px 38px rgba(52,71,55,.28), inset 0 0 0 5px rgba(216,197,163,.55)"}}/>
      <div style={{position:"absolute",left:49,top:45,width:190,height:110,borderRadius:"50%",background:"rgba(255,255,255,.15)",transform:"rotate(-22deg)"}}/>
      <div style={{position:"absolute",left:82,bottom:73,width:130,height:62,borderRadius:"70% 30% 70% 30%",background:"#9aaa86",transform:"rotate(-28deg)",border:"4px solid rgba(246,239,224,.45)"}}/>
      <div style={{position:"absolute",right:76,bottom:62,width:90,height:70,borderRadius:"48% 48% 42% 42%",background:"#c98f99",border:"5px solid #f3dfe1"}}/>
      <div style={{position:"absolute",right:99,bottom:116,width:45,height:48,borderRadius:"50% 50% 12px 12px",background:"#efe6d4",border:"4px solid #c9b894"}}/>
      <Dot left={95} top={113} size={15}/><Dot left={383} top={117} size={10}/><Dot left={365} top={328} size={12} color="#e6c56f"/><Dot left={127} top={361} size={8} color="#efd9dc"/>
      <div style={{position:"absolute",top:128,color:"#fffaf0",fontSize:166,fontWeight:700,letterSpacing:-12,textShadow:"0 5px 0 rgba(45,61,46,.48)"}}>AB</div>
      <div style={{position:"absolute",bottom:91,color:"#f2dfab",fontSize:30,letterSpacing:7,fontWeight:700}}>BUBBLE</div>
      <div style={{position:"absolute",top:54,right:75,color:"#f6dc93",fontSize:40}}>✦</div>
      <div style={{position:"absolute",bottom:51,left:215,color:"#f6efe0",fontSize:28}}>❀</div>
    </div>,
    size
  );
}