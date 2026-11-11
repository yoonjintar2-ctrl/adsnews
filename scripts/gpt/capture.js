// ChatGPT 대화 탭에서 javascript_tool로 한 번 실행해 도우미를 등록한다(2026-11-12 실사용 확인판).
// __last()  : 대화 본문의 마지막 그림 "개수 가로x세로 파일ID" — 새 그림이 왔는지(파일ID가 바뀌었는지) 확인하고 나서 캡처한다
// __gptShow(W): 마지막 그림을 흰 오버레이에 css 너비 W로 띄움 → "W H VW VH" 반환
// __gptAt(x,y): 그림을 (x,y)만큼 밀어 다음 타일을 보여 줌 → 실제 밀린 "x,y" 반환(stitch_grid.py에 그대로 넣는다)
// __gptHide() : 오버레이 제거
window.__cands=function(){const side=document.querySelector('nav');const sw=side?side.getBoundingClientRect().right:0;
  return [...document.querySelectorAll('img')].filter(i=>{if(i.naturalWidth<700||i.naturalHeight<500)return false;const r=i.getBoundingClientRect();return r.width>0&&r.left>=sw-5&&r.left<innerWidth*0.55})};
window.__last=function(){const sc=[...document.querySelectorAll('main *')].filter(e=>e.scrollHeight>e.clientHeight+50&&getComputedStyle(e).overflowY!='visible').sort((a,b)=>b.clientHeight-a.clientHeight)[0];if(sc)sc.scrollTop=sc.scrollHeight;
  const c=__cands();const l=c[c.length-1];return c.length+' '+(l?l.naturalWidth+'x'+l.naturalHeight+' '+(l.currentSrc||l.src).split('/').pop().slice(0,60).replace(/[?&=]/g,'_'):'-')};
window.__gptShow=async function(W,nth){const ims=__cands();const i=ims[ims.length-1-(nth||0)];if(!i)return 'NOIMG';
  let o=document.getElementById('__ov');if(o)o.remove();o=document.createElement('div');o.id='__ov';
  o.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#fff;cursor:none;overflow:hidden';
  const im=new Image();im.src=i.currentSrc||i.src;await im.decode();   // fetch는 CORS로 막힘 — 주소를 그대로 쓴다
  const D=W||Math.min(im.naturalWidth,innerWidth-60),DH=Math.round(im.naturalHeight*D/im.naturalWidth);
  im.style.cssText='position:absolute;left:0;top:0;max-width:none;width:'+D+'px;height:'+DH+'px';
  o.appendChild(im);document.body.appendChild(o);window.__ov={im,D,DH};
  return 'W '+D+' H '+DH+' VW '+innerWidth+' VH '+innerHeight+' natural '+im.naturalWidth+'x'+im.naturalHeight};
window.__gptAt=function(x,y){x=Math.max(0,Math.min(x,__ov.D-innerWidth+10));y=Math.max(0,Math.min(y,__ov.DH-innerHeight+30));__ov.im.style.left=(-x)+'px';__ov.im.style.top=(-y)+'px';return x+','+y};
window.__gptHide=function(){const o=document.getElementById('__ov');if(o)o.remove();return 'hidden'};
'ready';
