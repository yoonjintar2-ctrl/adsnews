// 사용: node scripts/m3d/render.cjs scenes/2026-11-13-cartoon.js img/jp/cartoon-2026-11-13-3d.mp4 [--w 960 --h 640] [--still 0.75]
//  저장소 루트에서 실행. 같은 이름의 .jpg(첫 장면 포스터)도 만든다. --still t 를 주면 그 순간 한 장만 out.jpg로 저장(검수용)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),http=require('http'),{execFileSync}=require('child_process');
const a=process.argv.slice(2);const arg=(k,d)=>{const i=a.indexOf('--'+k);return i>=0?a[i+1]:d};
const scene=a[0],out=a[1],W=+arg('w',960),H=+arg('h',640),still=arg('still',null);
const root=path.resolve(__dirname);const types={'.js':'text/javascript','.html':'text/html','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const repo=path.resolve(__dirname,'../..');
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);let f=u.startsWith('/repo/')?path.join(repo,u.slice(6)):path.join(root,u);
 fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0);
(async()=>{const port=srv.address().port;
 const b=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(`http://localhost:${port}/render.html?scene=${encodeURIComponent(scene)}&w=${W}&h=${H}`);
 try{await p.waitForFunction('window.ready===true',null,{timeout:60000})}catch(e){console.error('장면을 못 불러옴:',errs.join(' | '));process.exit(1)}
 const secs=await p.evaluate('window.SECS');
 const dir=fs.mkdtempSync(path.join(require('os').tmpdir(),'m3d-'));
 if(still!==null){const d=await p.evaluate(t=>frame(t),+still);fs.writeFileSync(out,Buffer.from(d.split(',')[1],'base64'));console.log('still',out,errs.join(' | '));await b.close();srv.close();return}
 const N=Math.round(secs*30);
 for(let i=0;i<N;i++){const d=await p.evaluate(t=>frame(t),i/30);fs.writeFileSync(path.join(dir,String(i).padStart(4,'0')+'.jpg'),Buffer.from(d.split(',')[1],'base64'))}
 await b.close();srv.close();
 const tmp=out.replace(/\.mp4$/,'.tmp.mp4');
 execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',path.join(dir,'%04d.jpg'),'-c:v','libx264','-crf','31','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart','-an',tmp]);
 fs.renameSync(tmp,out); fs.copyFileSync(path.join(dir,'0000.jpg'),out.replace(/\.mp4$/,'.jpg'));
 fs.rmSync(dir,{recursive:true,force:true});
 console.log('ok',out,(fs.statSync(out).size/1024|0)+'KB',N+'frames',errs.length?'errors: '+errs.join(' | '):'');
})();
