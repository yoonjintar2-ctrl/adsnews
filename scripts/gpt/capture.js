// ChatGPT 탭에서 실행: 마지막으로 생성된 그림을 화면 전체 오버레이에 원본 크기로 띄우고 타일 단위로 보여 준다.
// 사용: 이 파일 내용을 javascript_tool로 한 번 실행 → __gptShow() → __gptTile(k) 마다 zoom 캡처 → __gptHide()
window.__gptShow=async function(nth){
  // 왼쪽 메뉴·오른쪽 패널(클라우드 브라우저 미리보기 등)을 빼고 대화 본문의 그림만 고른다
  const side=document.querySelector('nav'); const sw=side?side.getBoundingClientRect().right:0;
  const ims=[...document.querySelectorAll('img')].filter(i=>{if(i.naturalWidth<700||i.naturalHeight<500)return false;const r=i.getBoundingClientRect();return r.width>0&&r.left>=sw-5&&r.left<innerWidth*0.55});
  const i=ims[ims.length-1-(nth||0)]; if(!i) return 'NOIMG';
  // fetch는 CORS로 막힐 수 있어 그림 주소를 그대로 쓴다
  let o=document.getElementById('__ov'); if(o) o.remove();
  o=document.createElement('div'); o.id='__ov';
  o.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#fff;cursor:none;overflow:hidden';
  const im=new Image(); im.src=i.currentSrc||i.src; await im.decode();
  const D=Math.min(im.naturalWidth, innerWidth-60), DH=Math.round(im.naturalHeight*D/im.naturalWidth), T=innerHeight-20;
  im.style.cssText='position:absolute;left:0;top:0;max-width:none;width:'+D+'px;height:'+DH+'px';
  o.appendChild(im); document.body.appendChild(o); window.__ov={im,T};
  return 'W '+D+' H '+DH+' T '+T+' VW '+innerWidth+' tiles '+Math.ceil(DH/T)+' natural '+im.naturalWidth+'x'+im.naturalHeight;
};
window.__gptTile=function(k){__ov.im.style.top=(-k*__ov.T)+'px';return 'tile '+k};
window.__gptHide=function(){const o=document.getElementById('__ov'); if(o) o.remove(); return 'hidden'};
'capture helpers ready';
