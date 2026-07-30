import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon(){
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",borderRadius:112,background:"linear-gradient(145deg,#ffd9e9 0%,#ff9fc8 48%,#cbb9ff 100%)",fontFamily:"cursive"}}>
      <div style={{position:"absolute",inset:18,borderRadius:96,border:"8px solid rgba(255,255,255,.72)",boxShadow:"inset 0 0 0 4px rgba(255,255,255,.28)"}} />
      <div style={{position:"absolute",width:374,height:374,borderRadius:"50%",background:"radial-gradient(circle at 34% 24%,rgba(255,255,255,.95) 0 8%,rgba(255,255,255,.35) 9% 18%,transparent 19%),radial-gradient(circle at 50% 44%,#ffbfd9 0%,#f58cba 68%,#e76fac 100%)",border:"8px solid rgba(255,255,255,.72)",boxShadow:"0 22px 38px rgba(138,68,112,.28),inset 0 0 34px rgba(255,255,255,.6)"}} />
      <div style={{position:"absolute",top:52,left:70,fontSize:48,color:"white"}}>✦</div>
      <div style={{position:"absolute",right:56,top:78,fontSize:42,color:"#fff4a8"}}>★</div>
      <div style={{position:"absolute",left:48,bottom:78,fontSize:46,color:"#ffffff"}}>♡</div>
      <div style={{position:"absolute",right:58,bottom:64,fontSize:52,color:"#fff"}}>☁</div>
      <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",marginTop:-6,color:"white",fontSize:178,fontWeight:700,letterSpacing:-26,textShadow:"0 7px 0 rgba(198,82,137,.35),0 0 14px rgba(255,255,255,.75)"}}>AB</div>
      <div style={{position:"absolute",right:110,bottom:120,color:"white",fontSize:70,textShadow:"0 5px 0 rgba(198,82,137,.3)"}}>♡</div>
    </div>,
    size
  );
}
