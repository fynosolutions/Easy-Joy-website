import http from 'node:http';
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dist=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try {
  const url=new URL(req.url,'http://localhost');
  const target=path.resolve(dist,'.'+decodeURIComponent(url.pathname));
  if(target!==dist&&!target.startsWith(dist+path.sep)){res.writeHead(403);res.end();return;}
  let filename=target;
  let stat=await fs.stat(filename).catch(()=>null);
  if(stat?.isDirectory()){
   if(!url.pathname.endsWith('/')){res.writeHead(308,{Location:url.pathname+'/'+url.search});res.end();return;}
   filename=path.join(filename,'index.html');stat=await fs.stat(filename).catch(()=>null);
  }
  let status=200;
  if(!stat?.isFile()){status=404;filename=path.join(dist,'404.html');stat=await fs.stat(filename);}
  const headers={'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  let start=0,end=stat.size-1;
  if(req.headers.range && status===200){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match || (!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
   if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}
   else start=Math.max(0,stat.size-Number(match[2]));
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);
  res.writeHead(status,headers);
  if(req.method==='HEAD'||stat.size===0){res.end();return;}
  const stream=createReadStream(filename,{start,end});
  stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 }catch{if(!res.headersSent){res.writeHead(400);res.end('Bad request');}else res.destroy();}
});
server.on('error',error=>{console.error(`Preview could not start: ${error.message}`);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
