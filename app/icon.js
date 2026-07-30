import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const Leaf=({left,top,rotate=0,color="#91a690",width=44,height=20})=><div style={{position:"absolute",left,top,width,height,borderRadius:"100% 0 100% 0",background:color,transform:`rotate(${rotate}deg)`,opacity:.92}}/>;

export default function Icon(){
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:"linear-gradient(145deg,#fffaf3,#e8f0f1)",fontFamily:"Georgia"}}>
      <div style={{position:"absolute",inset:28,borderRadius:122,background:"#fffdf8",border:"2px solid #d9d2c7",boxShadow:"0 22px 42px rgba(62,72,65,.14), inset 0 0 0 8px rgba(255,250,243,.92)"}}/>
      <div style={{position:"absolute",left:102,top:91,width:5,height:190,background:"#718b78",borderRadius:5,transform:"rotate(-28deg)",transformOrigin:"bottom"}}/>
      <div style={{position:"absolute",right:102,bottom:86,width:5,height:190,background:"#718b78",borderRadius:5,transform:"rotate(-28deg)",transformOrigin:"bottom"}}/>
      <Leaf left={82} top={151} rotate={-42} width={54} height={24}/><Leaf left={111} top={111} rotate={-12} color="#a8b9a7" width={50} height={22}/><Leaf left={94} top={221} rotate={18} color="#7f987f" width={52} height={23}/>
      <Leaf left={353} top={304} rotate={138} width={54} height={24}/><Leaf left={333} top={356} rotate={174} color="#7f987f" width={50} height={22}/><Leaf left={370} top={246} rotate={112} color="#a8b9a7" width={52} height={23}/>
      <div style={{position:"absolute",right:126,top:126,width:58,height:58,borderRadius:"50%",background:"#e9c8cf",opacity:.9}}/>
      <div style={{position:"absolute",right:140,top:140,width:30,height:30,borderRadius:"50%",background:"#e8c77c"}}/>
      <div style={{position:"absolute",top:150,color:"#34483d",fontSize:144,fontWeight:700,letterSpacing:-10,lineHeight:1}}>B</div>
      <div style={{position:"absolute",bottom:116,width:188,height:1,background:"#cbbfb2"}}/>
      <div style={{position:"absolute",bottom:72,color:"#8a7079",fontSize:22,letterSpacing:6,fontWeight:700}}>BECOMING</div>
    </div>,
    size
  );
}
