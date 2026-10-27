import { readFileSync, writeFileSync } from "node:fs";
const N=1600, W=100.47,E=100.59,S=13.45,Nn=13.57, mpp=(Nn-S)*111320/N;
const col = lon => Math.round((lon-W)/(E-W)*N), row = lat => Math.round((Nn-lat)/(Nn-S)*N);
const res={};
for (const y of [1988,2000,2010,2025]) {
  const a = readFileSync(`C:/tmp/nir${y}.raw`);
  const bottom=[...a.subarray((N-1)*N,N*N)].sort((p,q)=>p-q); const med=bottom[N>>1];
  const thr = Number(process.argv[2]||0) || med*1.6+8;
  const sea=new Uint8Array(N*N); const st=[];
  for(let x=0;x<N;x++){const i=(N-1)*N+x; if(a[i]<thr){sea[i]=1;st.push(i);}}
  while(st.length){const i=st.pop(),x=i%N,yy=(i/N)|0;for(const j of [x>0?i-1:-1,x<N-1?i+1:-1,yy>0?i-N:-1,yy<N-1?i+N:-1]) if(j>=0&&!sea[j]&&a[j]<thr){sea[j]=1;st.push(j);}}
  // shoreline row per column = smallest row of sea in that column below row(13.54)
  const shore=[]; for(let x=0;x<N;x++){let r=row(13.545); while(r<N&&!sea[r*N+x]) r++; shore.push(r);}
  writeFileSync(`C:/tmp/shore${y}.json`, JSON.stringify(shore.map(r=>+(Nn-r/N*(Nn-S)).toFixed(5))));
  const c=col(100.5312), tr=row(13.50697);
  const win=shore.slice(c-60,c+61).sort((p,q)=>p-q); const m=win[60];
  res[y]={thr:+thr.toFixed(1), shoreLat:+(Nn-m/N*(Nn-S)).toFixed(5), templeToShore_m: Math.round((m-tr)*mpp), templeIsSea: !!sea[tr*N+c]};
}
console.log(res); console.log("retreat 1988→2025 m:", Math.round((res[1988].shoreLat-res[2025].shoreLat)*-111320));
