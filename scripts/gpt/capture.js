// ChatGPT 탭에서 실행: 마지막으로 생성된 그림을 화면 전체 오버레이에 원본 크기로 띄우고 타일 단위로 보여 준다.
// 사용: 이 파일 내용을 javascript_tool로 한 번 실행 → __gptShow() → __gptTile(k) 마다 zoom 캡처 → __gptHide()
window.__gptShow=async function(nth){
  const ims=[...document.querySelectorAll('main img')].filter(i=>i.naturalWidth>=700&&i.naturalHeight>=500);
  const i=ims[ims.length-1-(nth||0)]; if(!i) return 'NOIMG';
  const b=await (await fetch(i.src,{credentials:'include'})).blob(); const u=URL.createObjectURL(b);
  let o=document.getElementById('__ov'); if(o) o.remove();
  o=document.createElement('div'); o.id='__ov';
  o.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#fff;cursor:none;overflow:hidden';
  const im=new Image(); im.src=u; await im.decode();
  const D=Math.min(im.naturalWidth, innerWidth-60), DH=Math.round(im.naturalHeight*D/im.naturalWidth), T=innerHeight-20;
  im.style.cssText='position:absolute;left:0;top:0;max-width:none;width:'+D+'px;height:'+DH+'px';
  o.appendChild(im); document.body.appendChild(o); window.__ov={im,T};
  return 'W '+D+' H '+DH+' T '+T+' VW '+innerWidth+' tiles '+Math.ceil(DH/T)+' natural '+im.naturalWidth+'x'+im.naturalHeight;
};
window.__gptTile=function(k){__ov.im.style.top=(-k*__ov.T)+'px';return 'tile '+k};
window.__gptHide=function(){const o=document.getElementById('__ov'); if(o) o.remove(); return 'hidden'};
'capture helpers ready';
