import { deflateSync } from "node:zlib";

export const runtime = "nodejs";
export const dynamic = "force-static";

const W=256,H=256,S=2,w=W*S,h=H*S;
const px=new Uint8Array(w*h*4);
const clamp=n=>Math.max(0,Math.min(255,Math.round(n)));
function put(x,y,r,g,b,a=255){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=w||y>=h)return;const i=(y*w+x)*4;const oa=px[i+3]/255,na=a/255,out=na+oa*(1-na);px[i]=clamp((r*na+px[i]*oa*(1-na))/(out||1));px[i+1]=clamp((g*na+px[i+1]*oa*(1-na))/(out||1));px[i+2]=clamp((b*na+px[i+2]*oa*(1-na))/(out||1));px[i+3]=clamp(out*255)}
function circle(cx,cy,rad,c,a=255){cx*=S;cy*=S;rad*=S;for(let y=Math.floor(cy-rad);y<=cy+rad;y++)for(let x=Math.floor(cx-rad);x<=cx+rad;x++){const d=Math.hypot(x-cx,y-cy);if(d<=rad+1){const aa=d<rad-1?a:a*Math.max(0,rad+1-d)/2;put(x,y,...c,aa)}}}
function line(x1,y1,x2,y2,thick,c,a=255){const n=Math.ceil(Math.hypot(x2-x1,y2-y1)*S/2);for(let i=0;i<=n;i++){const t=i/n;circle(x1+(x2-x1)*t,y1+(y2-y1)*t,thick/2,c,a)}}
function bez(p0,p1,p2,p3,thick,c,a=255){let prev=p0;for(let i=1;i<=80;i++){const t=i/80,u=1-t;const p=[u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]];line(prev[0],prev[1],p[0],p[1],thick,c,a);prev=p}}
function star(x,y,r,c){for(let i=0;i<8;i++){const a=i*Math.PI/4;line(x,y,x+Math.cos(a)*r,y+Math.sin(a)*r,i%2?1.5:2.4,c,210)}}
function heart(x,y,s,c){circle(x-s*.28,y-s*.18,s*.34,c);circle(x+s*.28,y-s*.18,s*.34,c);for(let yy=0;yy<s*.9;yy++)for(let xx=-s*.55;xx<=s*.55;xx++){if(Math.abs(xx)<=s*.55*(1-yy/(s*.95)))circle(x+xx,y+yy*.55,s*.06,c)}}
// blush-pink rounded-square background
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const nx=x/w,ny=y/h;const glow=Math.max(0,1-Math.hypot(nx-.32,ny-.18)*1.25);put(x,y,255,222+18*glow,238+10*glow,255)}
// soft corner bubbles and whimsical stars
circle(35,46,16,[255,244,249],210);circle(36,46,12,[250,178,207],120);circle(218,204,14,[255,245,250],200);circle(218,204,10,[247,161,199],115);
star(37,194,9,[255,255,255]);star(214,50,11,[255,255,255]);star(222,118,6,[255,246,168]);star(44,110,5,[255,255,255]);
// main translucent bubble
circle(128,126,101,[255,245,250],230);circle(128,126,96,[246,137,181],235);circle(118,111,83,[251,167,202],180);circle(128,126,96,[255,255,255],28);
// glossy rim and highlights
for(let r=96;r>=90;r--)circle(128,126,r,[255,255,255],r===96?80:8);
bez([69,70],[91,32],[151,24],[181,54],11,[255,255,255],185);
bez([73,75],[96,47],[120,42],[140,44],4,[255,255,255],150);
bez([166,185],[187,170],[196,148],[198,132],8,[255,255,255],150);
// AB lettering: shadow then creamy white rounded strokes
const shadow=[205,76,130],white=[255,246,250];
function drawAB(c,t,dx=0,dy=0){bez([72+dx,178+dy],[87+dx,124+dy],[103+dx,74+dy],[117+dx,55+dy],t,c);bez([117+dx,55+dy],[120+dx,104+dy],[124+dx,150+dy],[127+dx,181+dy],t,c);bez([83+dx,130+dy],[104+dx,122+dy],[119+dx,119+dy],[137+dx,120+dy],t,c);bez([137+dx,63+dy],[142+dx,105+dy],[144+dx,145+dy],[142+dx,181+dy],t,c);bez([139+dx,65+dy],[181+dx,54+dy],[190+dx,88+dy],[151+dx,111+dy],t,c);bez([151+dx,111+dy],[195+dx,108+dy],[195+dx,157+dy],[145+dx,177+dy],t,c)}
drawAB(shadow,10,2,3);drawAB(white,7);
heart(198,145,15,[255,240,247]);star(59,58,6,[255,255,255]);star(189,78,7,[255,255,255]);
// downsample 2x for smoother edges
const out=new Uint8Array(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){for(let k=0;k<4;k++){let sum=0;for(let yy=0;yy<S;yy++)for(let xx=0;xx<S;xx++)sum+=px[((y*S+yy)*w+(x*S+xx))*4+k];out[(y*W+x)*4+k]=sum/(S*S)}}
function crc32(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function chunk(type,data){const t=Buffer.from(type);const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc])}
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;Buffer.from(out.buffer,out.byteOffset+y*W*4,W*4).copy(raw,y*(W*4+1)+1)}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);
export function GET(){return new Response(png,{headers:{"Content-Type":"image/png","Cache-Control":"public, max-age=31536000, immutable"}})}