import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const Petal=({left,top,rotate=0,color="#d9b6b7",width=34,height=18})=><div style={{position:"absolute",left,top,width,height,borderRadius:"100% 0 100% 0",background:color,transform:`rotate(${rotate}deg)`,opacity:.9}}/>;

export default function Icon(){
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:"linear-gradient(145deg,#f8f4ec,#eee7dc)",fontFamily:"Georgia"}}>
      <div style={{position:"absolute",inset:28,borderRadius:122,background:"#fffdf8",border:"2px solid #cfc4b4",boxShadow:"0 22px 42px rgba(79,72,61,.16), inset 0 0 0 8px rgba(247,243,235,.9)"}}/>
      <div style={{position:"absolute",left:98,top:84,width:5,height:180,background:"#7f927c",borderRadius:5,transform:"rotate(-28deg)",transformOrigin:"bottom"}}/>
      <div style={{position:"absolute",right:100,bottom:86,width:5,height:180,background:"#7f927c",borderRadius:5,transform:"rotate(-28deg)",transformOrigin:"bottom"}}/>
      <Petal left={80} top={144} rotate={-42} color="#9eae97" width={52} height={24}/><Petal left={108} top={105} rotate={-12} color="#aebba4" width={48} height={22}/><Petal left={91} top={211} rotate={18} color="#879b83" width={50} height={23}/>
      <Petal left={354} top={302} rotate={138} color="#9eae97" width={52} height={24}/><Petal left={335} top={354} rotate={174} color="#879b83" width={48} height={22}/><Petal left={371} top={244} rotate={112} color="#aebba4" width={50} height={23}/>
      <Petal left={335} top={102} rotate={12}/><Petal left={370} top={118} rotate={66}/><Petal left={353} top={146} rotate={124}/><Petal left={322} top={132} rotate={-46}/>
      <div style={{position:"absolute",right:128,top:128,width:18,height:18,borderRadius:"50%",background:"#b79b69"}}/>
      <div style={{position:"absolute",top:146,color:"#414a40",fontSize:170,fontWeight:700,letterSpacing:-16,lineHeight:1}}>AB</div>
      <div style={{position:"absolute",bottom:112,width:180,height:1,background:"#c6b7a3"}}/>
      <div style={{position:"absolute",bottom:72,color:"#8d7779",fontSize:23,letterSpacing:8,fontWeight:700}}>BUBBLE</div>
    </div>,
    size
  );
}