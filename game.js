
const NREELS = 6, NROWS = 5;

/* ---------- AUDIO ---------- */
let soundCharge,soundLightning,soundMonks,soundReelStop,soundReelSpin,soundCoins,soundHolly,soundDragon,soundMusicBox,bgMusic,soundRaid,soundSpin,soundWin,soundClick,soundNewFire,soundResetFire,soundHold1,soundHold2,soundCaosFreeze,soundNpcReward,soundBlessingMusic;
let holdSoundToggle=false;
let loggedIn=false, musicOn=true, bgDuck=false;
let sessionSpins=0, monkDone=false, monkSpin=30+Math.floor(Math.random()*121), monksActive=false, monkTimer=null, golemDone=false, golemSpin=43+Math.floor(Math.random()*112), golemActive=false, golemProgress=0, ferumbrasSuccess=Math.random()<0.35, spinsToNextRumor=25+Math.floor(Math.random()*16), rumorIdx=0;
let hollyActive=false, dragonPhase=0, dragonCountdown=0, dragonFireSpins=0, autoSpinsLeft=0, autoIdx=0, turboOn=false, autoTimer=null, tipBetCooldown=0, spinsToNextTip=14;
const PIN='1960';
function applyMusicVolume(){ if(bgMusic) bgMusic.volume=(bgDuck||monksActive)?0.05:0.3; }
function duck(on){ bgDuck=on; applyMusicVolume(); }
function startMusic(){ if(bgMusic&&musicOn){ applyMusicVolume(); bgMusic.play().catch(()=>{}); } }
function updateMusicBtn(){ const b=document.getElementById('music-btn'); if(b) b.innerText=musicOn?'🔊 WŁ':'🔇 WYŁ'; }
function toggleMusic(){ initAudio(); musicOn=!musicOn; if(musicOn) startMusic(); else if(bgMusic) bgMusic.pause(); updateMusicBtn(); }
function onPinInput(){ const i=document.getElementById('pin-input'); i.value=i.value.replace(/\D/g,''); if(i.value.length===4) tryLogin(); }
function tryLogin(){
  const i=document.getElementById('pin-input'), m=document.getElementById('pin-msg'), ls=document.getElementById('login-screen');
  if(i.value===PIN){
    loggedIn=true; ls.style.opacity=0; setTimeout(()=>ls.style.display='none',500);
    initAudio(); startMusic(); updateUI();
  } else {
    m.innerText='Błędny PIN'; i.value=''; i.classList.remove('shake'); void i.offsetWidth; i.classList.add('shake');
  }
}
/* Ładuje dźwięk, próbując kolejno kilku wariantów nazwy (pojedyncze/podwójne podkreślniki) */
function loadAudio(names){
  /* najpierw próbuje wersji .mp3 (po konwersji), potem oryginalnych rozszerzeń */
  const mp3=names.filter(n=>/\.(wav|aiff|ogg)$/i.test(n)).map(n=>n.replace(/\.[^.]+$/,'.mp3'));
  names=mp3.concat(names);
  const a=new Audio(); let i=0;
  a.preload='auto';
  a.addEventListener('error',()=>{ i++; if(i<names.length){ a.src=encodeURI(names[i]); a.load(); } });
  a.src=encodeURI(names[0]);
  return a;
}
function initAudio(){
  try{
    if(!soundSpin){
      soundSpin=loadAudio(['352208__inspectorj__smashing-wooden-fence-c.wav','352208_inspectorj_smashing-wooden-fence-c.wav']);
      soundWin=loadAudio(['win.mp3','win.wav']);
      soundClick=loadAudio(['click.mp3','click.wav']);
      soundNewFire=loadAudio(['730704__newlocknew__fireburn_campfirecloselongcracklingflame-roarsqueackhiss.wav','730704_newlocknew_fireburn_campfirecloselongcracklingflame-roarsqueackhiss.wav']);
      soundResetFire=loadAudio(['104990__robinhood76__02144-close-wather-plushes.wav','104990__robinhood76_02144-close-wather-plushes.wav']);
      soundHold1=loadAudio(['688048__faragilus__ululu-dark-mage-casting-a-spell.ogg','688048_faragilus_ululu-dark-mage-casting-a-spell.ogg','848661__mikiko850__water-impact-magic-spell.wav']);
      soundHold2=loadAudio(['848661__mikiko850__water-impact-magic-spell.wav','848661_mikiko850_water-impact-magic-spell.wav']);
      soundCaosFreeze=loadAudio(['516911__xythe__snippet.wav','516911_xythe_snippet.wav']); soundCaosFreeze.loop=true;
      soundNpcReward=loadAudio(['2539__eliasheuninck__bel1.aiff','2539_eliasheuninck_bel1.aiff','bel1.wav']);
      soundBlessingMusic=loadAudio(['aktywacjablogoslawienstw.mp3']);
      soundRaid=loadAudio(['rajd.mp3']);
      soundMusicBox=loadAudio(['musicbox.mp3']);
      soundMonks=loadAudio(['monki1.mp3']);
      soundCharge=loadAudio(['ladowanie.mp3']);
      soundLightning=loadAudio(['piorun.mp3']);
      soundReelStop=loadAudio(['reel_stop.mp3','reel_stop.wav']);
      soundReelSpin=loadAudio(['reel_spin.mp3','reel_spin.wav']); soundReelSpin.loop=true; soundReelSpin.volume=0.35;
      soundCoins=loadAudio(['monety.mp3','monety.wav']);
      soundHolly=loadAudio(['bigwin.mp3','hollycaos.wav']);
      soundDragon=loadAudio(['smok_ryk.mp3','smok_ryk.wav']);
      bgMusic=loadAudio(['muzyka.mp3']); bgMusic.loop=true; bgMusic.volume=0.3;
    }
  }catch(e){ console.warn('Audio init error',e); }
}
function playSound(a){ if(a){ try{ a.currentTime=0; a.play().catch(()=>{}); }catch(e){} } }
function playAlternatingHoldSound(){ initAudio(); playSound(holdSoundToggle?soundHold1:soundHold2); holdSoundToggle=!holdSoundToggle; }


/* ---------- DANE ---------- */
const latinQuotes=["Exori Vis Benedictio!","In Nomine Caos, Absolvo!","Virtus Et Gloria In Saecula!","Sanctum Arcanum Exsurge!","Benedictio Ferumbrasi Vobiscum!"];
const translations={
  iceCubeBonusMsg:"❄️ ZEBRANO 6 ICE CUBE! Zamrożono ogień i przyznano 500 CAOSCOIN! ❄️",
  crystalBoostMsg:"💎 ZEBRANO 10 LIFE CRYSTAL! +50% Wygranych na 30 Spinów! 💎",
  npcQuotes:["Pusto, przyjacielu! Spróbuj ponownie.","Pechowy rzut! Może następnym razem?","Ogień rośnie! Musisz w końcu coś trafić!"],
  normaQuotes:[
    "Zbieraj Life Crystal... 10 sztuk da ci +50% wygranych na 30 spinów!",
    "Caos jest dobroczynny, każdemu z nas dał cel w życiu...",
    "Zbierz 6 kostek lodu, a zamrożą ogień pecha!",
    "Więcej linii [L] i wyższa stawka to też większe ryzyko najazdu!",
    "Pamiętaj o przyciskach HOLD [1]-[6], aby zablokować cenne przedmioty!"
  ]
};

/* Wagi dobrane tak, by RTP było ok. 90-95% (bez bonusów). Błogosławieństwa bardzo rzadkie. */
const items=[
  {name:"Health Potion",file:"health_potion.gif",weight:30,multiplier:1},
  {name:"Hat of the Mad",file:"hat_of_the_mad.gif",weight:22,multiplier:2},
  {name:"SD Rune",file:"sudden_death_rune.gif",weight:17,multiplier:3},
  {name:"Boots of Haste",file:"boots_of_haste.gif",weight:13,multiplier:5},
  {name:"Crown Helmet",file:"crown_helmet.gif",weight:10,multiplier:7},
  {name:"Golden Armor",file:"golden_helmet.gif",weight:7,multiplier:12},
  {name:"Demon Shield",file:"demon_shield.gif",weight:5,multiplier:18},
  {name:"Royal Helmet",file:"royal_helmet.gif",weight:3.5,multiplier:30},
  {name:"Soft Boots",file:"soft_boots.gif",weight:2.5,multiplier:50},
  {name:"MPA",file:"magic_plate_armor.gif",weight:1.5,multiplier:90},
  {name:"Golden Helmet",file:"golden_helmet.gif",weight:0.8,multiplier:250},
  {name:"Magic Longsword",file:"magic_longsword.gif",weight:0.4,multiplier:600},
  {name:"Ice Cube",file:"ice_cube.gif",weight:1.0,multiplier:0,isIce:true},
  {name:"Life Crystal",file:"life_crystal.gif",weight:1.2,multiplier:0,isCrystal:true},
  {name:"Scarab Amulet",file:"scarab_amulet.gif",weight:0.03,multiplier:0,isScarab:true},
  {name:"Blue Gem",file:"blue_gem.gif",weight:0.03,multiplier:0,isBlueGem:true},
  {name:"Gold Ring",file:"gold_ring.gif",weight:0.03,multiplier:0,isGoldRing:true},
  {name:"Demonic Essence",file:"demonic_essence.gif",weight:0.03,multiplier:0,isEssence:true},
  {name:"Music Box",file:"music_box_chayenne.gif",weight:0.01,multiplier:0,isMusicBox:true}
];
const TOTAL_WEIGHT=items.reduce((a,b)=>a+b.weight,0);
items.forEach(i=>{ i.winGif=i.file; });

/* mnożnik za długość układu (od lewej) */
const lenPay={2:1.5,3:3,4:9,5:30,6:120};

/* 10 linii: numer wiersza (0=góra,1=środek,2=dół) dla każdego z 6 bębnów */
/* 20 linii: numer wiersza (0=góra ... 4=dół) dla każdego z 6 bębnów */
const lineRows=[[2,2,2,2,2,2],[1,1,1,1,1,1],[3,3,3,3,3,3],[0,0,0,0,0,0],[4,4,4,4,4,4],
  [0,1,2,2,1,0],[4,3,2,2,3,4],[2,1,0,0,1,2],[2,3,4,4,3,2],[0,1,2,3,4,4],
  [4,3,2,1,0,0],[1,0,0,0,0,1],[3,4,4,4,4,3],[1,2,3,3,2,1],[3,2,1,1,2,3],
  [0,1,0,1,0,1],[4,3,4,3,4,3],[2,1,2,3,2,1],[1,2,1,2,1,2],[3,2,3,2,3,2]];
const allPaylines=lineRows.map((rows,i)=>({name:'LINIA '+(i+1),rows}));
const lineOptions=[1,5,10,15,20];
const bets=[5,10,20,50,80,100];

/* ---------- STAN ---------- */
let currentBetIndex=1, lineIndex=0, selectedLines=1;
let credits=1000, isSpinning=false, holds=Array(NREELS).fill(false);
let consecutiveLosses=0, crystalCollected=0, iceCollectedThisRun=0;
let boostSpinsLeft=0, caosFreezeSpinsLeft=0, scarabCharges=0, hasBlueGem=false, goldRingActive=false, essenceCount=0;
let invasionSpinsLeft=0, currentInvaderFile="", raidCooldown=0;
let lastWinsHistory=[];
let spinsToNextNpc=Math.floor(Math.random()*8)+5, spinsToNextNorma=Math.floor(Math.random()*31)+25;
let npcTimeout=null,normaTimeout=null,caosTimeout=null,ferumbrasTimeout=null;
let currentReelsData=Array.from({length:NREELS},()=>[items[0],items[1],items[2],items[0],items[1]]);

/* ---------- SZANSE ---------- */
function raidChance(){
  const bet=bets[currentBetIndex];
  let c=0.003 + bet*0.00004 + (selectedLines-1)*0.0005;
  c+=crystalCollected*0.0002 + iceCollectedThisRun*0.0003 + scarabCharges*0.0003 + essenceCount*0.0003;
  if(hasBlueGem) c*=0.8;
  if(raidCooldown>0) return 0;
  return Math.min(c,0.03);
}
function caosChance(){ return goldRingActive?0.9:0.05; }
function lineHitChance(){ // szansa na wygraną (2+ z rzędu) na jednej linii
  let h=0;
  items.forEach(it=>{ if(it.multiplier>0){ const p=it.weight/TOTAL_WEIGHT; h+=p*p*(1-p)+p**3*(1-p)+p**4*(1-p)+p**5*(1-p)+p**6; } });
  return h;
}
const fmtPct=x=>(x*100).toFixed(x<0.1?2:0)+'%';

/* ---------- BĘBNY 3D ---------- */
const F=20, DEG=18, RAD=230;
let faces=[], imgs=[], cyls=[], rotA=[], baseF=[];
const mod=(n,m)=>((n%m)+m)%m;
function cellEl(r,c){ return faces[r][mod(baseF[r]+2-c,F)]; }

/* ---------- BUDOWA UI ---------- */
(function build(){
  const m=document.getElementById('slot-machine');
  for(let r=0;r<NREELS;r++){
    let fh='';
    for(let f=0;f<F;f++) fh+=`<div class="face"><img alt=""></div>`;
    m.insertAdjacentHTML('beforeend',`<div class="reel-container"><div class="reel-strip"><div class="reel-cyl" id="cyl${r}">${fh}</div></div><div id="hold${r+1}" class="hold-btn">[${r+1}] HOLD</div></div>`);
    cyls[r]=document.getElementById('cyl'+r);
    cyls[r].style.transform=`translateZ(-${RAD}px) rotateX(0deg)`;
    faces[r]=Array.from(cyls[r].children);
    faces[r].forEach((fc,f)=>{ fc.style.transform=`rotateX(${f*DEG}deg) translateZ(${RAD}px)`; });
    imgs[r]=faces[r].map(x=>x.firstChild);
    imgs[r].forEach(im=>im.addEventListener('error',()=>{ if(!/health_potion\.gif$/.test(im.src)) im.src='health_potion.gif'; }));
    imgs[r].forEach((im,f)=>{ im.src=items[f%12].file; });
    rotA[r]=0; baseF[r]=0;
  }
  document.getElementById('bet-list').innerHTML=bets.map((b,i)=>`<div id="badge-${b}" class="bet-badge">${b}</div>`).join('');
  document.getElementById('lines-list').innerHTML=lineOptions.map((n,i)=>`<div id="lbadge-${n}" class="bet-badge">${n}</div>`).join('');
  document.getElementById('len-table').innerHTML='<tr><th>Układ od lewej</th>'+Object.keys(lenPay).map(k=>`<th>${k} z rzędu</th>`).join('')+'</tr><tr><td>Mnożnik długości</td>'+Object.values(lenPay).map(v=>`<td>x${v}</td>`).join('')+'</tr>';
  document.getElementById('drop-table').innerHTML='<tr><th>Przedmiot</th><th>Szansa / pole</th><th>Mnożnik</th></tr>'+
    items.map(i=>`<tr><td>${i.name}</td><td>${(i.weight/TOTAL_WEIGHT*100).toFixed(2)}%</td><td>${i.multiplier?('x'+i.multiplier):'błogosławieństwo / bonus'}</td></tr>`).join('');
})();

/* ---------- LOSOWANIE ---------- */
function getRandomItem(){
  if(invasionSpinsLeft>0 && currentInvaderFile) return {name:"Invader",file:currentInvaderFile,weight:1,multiplier:0};
  let rand=Math.random()*TOTAL_WEIGHT, cum=0;
  for(const it of items){ cum+=it.weight; if(rand<cum) return it; }
  return items[0];
}
function genReel(){ return Array.from({length:NROWS},()=>getRandomItem()); }
function renderReels(){
  for(let r=0;r<NREELS;r++) for(let c=0;c<NROWS;c++) imgs[r][mod(baseF[r]+2-c,F)].src=currentReelsData[r][c].file;
}
function clearWinHighlights(){
  faces.forEach(a=>a.forEach(e=>e.classList.remove('win-cell')));
  const old=document.getElementById('payline-overlay'); if(old) old.innerHTML='';
}
function drawWinningPayline(line,count){
  const machine=document.getElementById('slot-machine');
  let svg=document.getElementById('payline-overlay');
  if(!svg){ svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.id='payline-overlay'; machine.appendChild(svg); }
  const mr=machine.getBoundingClientRect();
  svg.setAttribute('viewBox',`0 0 ${mr.width} ${mr.height}`);
  const pts=[];
  for(let r=0;r<count;r++){
    const cell=cellEl(r,line.rows[r]);
    const cr=cell.getBoundingClientRect();
    pts.push(`${cr.left+cr.width/2-mr.left},${cr.top+cr.height/2-mr.top}`);
  }
  if(pts.length<2) return;
  for(const cls of ['payline-glow','payline-main']){
    const path=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    path.setAttribute('points',pts.join(' ')); path.setAttribute('class',cls); svg.appendChild(path);
  }
}
function hasAnticipation(){
  return allPaylines.slice(0,selectedLines).some(l=>{ const x=currentReelsData[0][l.rows[0]], y=currentReelsData[1][l.rows[1]]; return x.multiplier>0 && x.name===y.name; });
}
function runReels(heldSnap,antic,onDone){
  const turbo=turboOn?0.38:1; let maxDur=0;
  for(let r=0;r<NREELS;r++){
    if(heldSnap[r]) continue;
    const oldB=baseF[r], newB=mod(oldB+6+Math.floor(Math.random()*9),F);
    const keep=new Set([0,1,2,3,4].map(k=>mod(oldB+2-k,F))), fin=new Set([0,1,2,3,4].map(k=>mod(newB+2-k,F)));
    for(let f=0;f<F;f++) if(!keep.has(f)&&!fin.has(f)) imgs[r][f].src=items[Math.floor(Math.random()*12)].file;
    for(let k=0;k<5;k++) imgs[r][mod(newB+2-k,F)].src=currentReelsData[r][k].file;
    rotA[r]+=(2+r)*360+mod(newB-oldB,F)*DEG;
    baseF[r]=newB;
    const dur=(1.0+r*0.3+(antic&&r>=2?0.45*(r-1):0))*turbo;
    maxDur=Math.max(maxDur,dur);
    cyls[r].style.transition=`transform ${dur}s cubic-bezier(.12,.72,.26,1.06)`;
    cyls[r].style.transform=`translateZ(-${RAD}px) rotateX(${-rotA[r]}deg)`;
    setTimeout(()=>{ initAudio(); playSound(soundReelStop); },Math.max(0,dur*1000-60));
  }
  setTimeout(()=>{ if(soundReelSpin) soundReelSpin.pause(); onDone(); },maxDur*1000+120);
}

function updateHistoryUI(amt,name){
  lastWinsHistory.unshift({amt,name}); if(lastWinsHistory.length>5) lastWinsHistory.pop();
  const l=document.getElementById('history-list'); l.innerHTML='';
  lastWinsHistory.forEach(h=>{ const b=document.createElement('div'); b.className='history-item'; b.innerText=`+${h.amt} (${h.name})`; l.appendChild(b); });
}
function updateUI(){
  const bet=bets[currentBetIndex];
  document.getElementById('credits').innerText=credits;
  document.getElementById('bet').innerText=bet;
  document.getElementById('total-bet').innerText=bet*selectedLines;
  document.getElementById('lines-count').innerText=selectedLines;
  document.getElementById('hud-crystal').innerText=`${crystalCollected}/10`;
  document.getElementById('hud-ice').innerText=`${iceCollectedThisRun}/6`;
  const show=(id,on)=>document.getElementById(id).style.display=on?'flex':'none';
  show('hud-scarab-row',scarabCharges>0); document.getElementById('hud-scarab-charges').innerText=`${scarabCharges} wygrane`;
  show('hud-essence-row',essenceCount>0); document.getElementById('hud-essence-val').innerText=`+${essenceCount*10}%`;
  show('hud-bluegem-row',hasBlueGem); show('hud-goldring-row',goldRingActive);
  show('hud-boost-row',boostSpinsLeft>0); document.getElementById('hud-boost-spins').innerText=`${boostSpinsLeft} sp.`;
  show('hud-freeze-row',caosFreezeSpinsLeft>0); document.getElementById('hud-freeze-spins').innerText=`${caosFreezeSpinsLeft} sp.`;
  show('hud-invasion-row',invasionSpinsLeft>0); document.getElementById('hud-invasion-spins').innerText=`${invasionSpinsLeft} sp.`;
  if(invasionSpinsLeft<=0) currentInvaderFile="";
  document.getElementById('hud-raid-chance').innerText=raidCooldown>0?'0% (blokada '+raidCooldown+')':fmtPct(raidChance());
  document.getElementById('hud-caos-chance').innerText=fmtPct(caosChance());
  document.getElementById('hud-hit-chance').innerText=fmtPct(lineHitChance());
  bets.forEach((b,i)=>document.getElementById(`badge-${b}`).classList.toggle('active',i===currentBetIndex));
  lineOptions.forEach((n,i)=>document.getElementById(`lbadge-${n}`).classList.toggle('active',i===lineIndex));
  if(caosFreezeSpinsLeft<=0 && !isSpinning && !hollyActive) document.getElementById('caos-container').classList.remove('visible');
  updateMusicBtn(); updateAutoBtn(); updateTurboBtn();
  { const cr=document.getElementById('hud-charge-row'); cr.style.display=golemActive?'flex':'none'; document.getElementById('hud-charge-val').innerText=Math.round(golemProgress/40*100)+'%'; }
  { const dr=document.getElementById('hud-dragon-row'); dr.style.display=dragonPhase===2?'flex':'none'; document.getElementById('hud-dragon-val').innerText=`${dragonFireSpins} sp.`; }
  for(let i=0;i<NREELS;i++) document.getElementById(`hold${i+1}`).classList.toggle('active',holds[i]);
}
function updateFireSpread(){
  const fc=document.getElementById('fire-container'); fc.innerHTML='';
  let n=Math.min(Math.floor(consecutiveLosses/5),12);
  const pos=[{top:'15%',left:'15%'},{top:'15%',right:'15%'},{top:'45%',left:'8%'},{top:'45%',right:'8%'},{top:'75%',left:'18%'},{top:'75%',right:'18%'},{top:'5%',left:'35%'},{top:'5%',right:'35%'},{top:'85%',left:'40%'},{top:'85%',right:'50%'},{top:'30%',left:'3%'},{top:'30%',right:'3%'}];
  for(let i=0;i<n;i++){
    const d=document.createElement('div'); d.className='ambient-fire'; const p=pos[i%pos.length];
    if(p.top) d.style.top=p.top; if(p.left) d.style.left=p.left; if(p.right) d.style.right=p.right;
    d.style.animationDelay=(i*0.2)+'s'; fc.appendChild(d);
  }
}

/* ---------- POSTACIE / EFEKTY ---------- */
function triggerFerumbrasBlessing(name){
  const c=document.getElementById('ferumbras-container');
  document.getElementById('ferumbras-text').innerText=`${latinQuotes[Math.floor(Math.random()*latinQuotes.length)]} (${name})`;
  c.classList.add('visible'); initAudio(); playSound(soundBlessingMusic);
  if(ferumbrasTimeout) clearTimeout(ferumbrasTimeout);
  ferumbrasTimeout=setTimeout(()=>c.classList.remove('visible'),9500);
}
function giveRashidSupport(){ credits+=500; initAudio(); playSound(soundNpcReward); triggerNpcSpeech("Wsparcie finansowe w drodze!"); updateUI(); }
function triggerNpcSpeech(t){
  const c=document.getElementById('npc-container'), q=translations.npcQuotes;
  document.getElementById('npc-text').innerText=t||q[Math.floor(Math.random()*q.length)];
  c.classList.add('visible'); if(npcTimeout) clearTimeout(npcTimeout);
  npcTimeout=setTimeout(()=>c.classList.remove('visible'),8500);
}
function triggerNormaSpeech(t){
  const c=document.getElementById('norma-container'), q=translations.normaQuotes;
  document.getElementById('norma-text').innerText=t||q[Math.floor(Math.random()*q.length)];
  c.classList.add('visible'); if(normaTimeout) clearTimeout(normaTimeout);
  normaTimeout=setTimeout(()=>c.classList.remove('visible'),9500);
}
function triggerCaosAppearance(){
  document.getElementById('caos-container').classList.add('visible');
  caosFreezeSpinsLeft=5;
  initAudio(); playSound(soundNpcReward); playSound(soundCaosFreeze);
}
let raidActive=false, raidState=null;
function triggerRaid(type){
  const necro=(type==='necro'), name=necro?"NECROMANCERZY":"ROTWORMY", file=necro?"necromancer.gif":"rotworm%20(1).gif";
  raidActive=true;
  raidState={necro,file,winIndex:Math.random()<0.5?0:1,picked:false};
  document.getElementById('raid-title').innerText=`NAJAZD: ${name}!`;
  document.getElementById('raid-img').src=file;
  document.getElementById('raid-desc').innerText=necro?"Atakują mroczni czarnoksiężnicy!":"Stada podziemnych gąsienic szturmują miasto!";
  for(let i=0;i<2;i++){
    const el=document.getElementById('raid-card-'+i);
    el.className='raid-card'; el.innerHTML=`<span>❓</span><small>POLE ${i+1} [${i+1}]</small>`;
  }
  document.getElementById('raid-status').innerText="Wybierz jedno z dwóch pól – pod jednym kryje się zwycięstwo, pod drugim klęska!";
  document.getElementById('raid-overlay').style.display='flex';
  triggerNormaSpeech(`UWAGA! Najazd: ${name} zbliża się do miasta!`);
  raidCooldown=25;
  initAudio(); duck(true); playSound(soundRaid);
}
function pickRaidCard(i){
  if(!raidActive||!raidState||raidState.picked) return;
  raidState.picked=true;
  let winIdx=raidState.winIndex, st=document.getElementById('raid-status');
  let scarab=false;
  if(scarabCharges>0){ scarabCharges--; winIdx=i; scarab=true; }
  const isWin=(i===winIdx);
  for(let j=0;j<2;j++){
    const el=document.getElementById('raid-card-'+j), w=(j===winIdx);
    el.className='raid-card revealed '+(w?'win':'lose')+(j===i?' chosen':'');
    el.innerHTML=w?'<span>🏆</span><small>+300 CC</small>':'<span>💀</span><small>NAJAZD!</small>';
  }
  st.innerText=isWin?(scarab?"🛡️ SCARAB AMULET ODPARŁ NAJAZD!":"⚔️ ODPIERASZ NAJAZD! Zwycięstwo!"):"💥 PRZEGRANA! Potwory przebijają się do bębnów!";
  const {necro,file}=raidState; updateUI();
  setTimeout(()=>{
    document.getElementById('raid-overlay').style.display='none';
    raidActive=false; raidState=null;
    if(soundRaid) soundRaid.pause();
    duck(false);
    if(isWin){ credits+=300; initAudio(); playSound(soundWin); triggerNpcSpeech("Zwycięstwo w walce z rajdowcami! Nagroda: +300 CC"); }
    else{
      invasionSpinsLeft=10; currentInvaderFile=file;
      if(necro){ iceCollectedThisRun=0; scarabCharges=0; hasBlueGem=false; goldRingActive=false; essenceCount=0; triggerNpcSpeech("INWAZJA NECRO: Skradziono Błogosławieństwa i zablokowano bębny!"); }
      else triggerNpcSpeech("Rotwormy zablokowały bębny maszyny na 10 spinów!");
    }
    updateUI();
  },2600);
}
let mbActive=false, mbState=null;
function openMusicBox(){
  mbState={winIndex:Math.random()<0.5?0:1,prize:500+50*Math.floor(Math.random()*11),picked:false};
  for(let i=0;i<2;i++){ const el=document.getElementById('mb-card-'+i); el.className='raid-card'; el.innerHTML=`<span>🎁</span><small>KARTA ${i+1} [${i+1}]</small>`; }
  document.getElementById('mb-status').innerText='Wybierz kartę!';
  document.getElementById('mb-overlay').style.display='flex';
  initAudio(); duck(true); playSound(soundMusicBox);
}
function pickMbCard(i){
  if(!mbActive||!mbState||mbState.picked) return;
  mbState.picked=true;
  const w=mbState.winIndex, isWin=(i===w), prize=mbState.prize;
  for(let j=0;j<2;j++){
    const el=document.getElementById('mb-card-'+j), win=(j===w);
    el.className='raid-card revealed '+(win?'win':'lose')+(j===i?' chosen':'');
    el.innerHTML=win?`<span>💰</span><small>+${prize} CC</small>`:'<span>💀</span><small>NECROMANCERZY!</small>';
  }
  document.getElementById('mb-status').innerText=isWin?`🎉 Music Box ukrywał ${prize} CAOSCOIN!`:'☠️ Z pudełka wyłaniają się Necromancerzy!';
  setTimeout(()=>{
    document.getElementById('mb-overlay').style.display='none';
    mbActive=false; mbState=null;
    if(soundMusicBox) soundMusicBox.pause();
    duck(false);
    if(isWin){ credits+=prize; initAudio(); playSound(soundNpcReward); updateHistoryUI(prize,'Music Box'); triggerNpcSpeech(`Music Box: +${prize} CC!`); }
    else triggerRaid('necro');
    updateUI();
  },2600);
}
function toggleInfoModal(){
  const m=document.getElementById('info-modal');
  if(m.style.display==='flex') m.style.display='none';
  else{ m.style.display='flex'; initAudio(); playSound(soundClick); }
}
function triggerWinEffect(it){
  const o=document.getElementById('win-overlay'); document.getElementById('win-gif').src=it.winGif||it.file;
  o.style.display='flex'; setTimeout(()=>o.style.display='none',2500);
}

/* ---------- STEROWANIE ---------- */
function toggleHold(i){ if(isSpinning) return; playAlternatingHoldSound(); holds[i]=!holds[i]; updateUI(); }
function setBet(i){ if(isSpinning) return; initAudio(); playSound(soundClick); currentBetIndex=i; updateUI(); maybeBetTip(); }
function setLines(i){ if(isSpinning) return; initAudio(); playSound(soundClick); lineIndex=i; selectedLines=lineOptions[i]; updateUI(); maybeBetTip(); }
function changeBet(){ if(isSpinning) return; initAudio(); playSound(soundClick); currentBetIndex=(currentBetIndex+1)%bets.length; updateUI(); maybeBetTip(); }
function changeLines(){ if(isSpinning) return; initAudio(); playSound(soundClick); lineIndex=(lineIndex+1)%lineOptions.length; selectedLines=lineOptions[lineIndex]; updateUI(); maybeBetTip(); }
function resetCredits(){ if(isSpinning) return; initAudio(); playSound(soundClick); giveRashidSupport(); }

function spin(){
  if(isSpinning||raidActive||mbActive||hollyActive||!loggedIn) return;
  initAudio();
  const cost=bets[currentBetIndex]*selectedLines;
  if(credits<cost && caosFreezeSpinsLeft<=0){ giveRashidSupport(); return; }
  if(caosFreezeSpinsLeft>0){ caosFreezeSpinsLeft--; if(caosFreezeSpinsLeft===0&&soundCaosFreeze) soundCaosFreeze.pause(); }
  else credits-=cost;
  if(boostSpinsLeft>0) boostSpinsLeft--;
  if(invasionSpinsLeft>0) invasionSpinsLeft--;
  if(raidCooldown>0) raidCooldown--;
  clearWinHighlights();
  document.getElementById('win-overlay').style.display='none';
  playSound(soundSpin);
  if(soundReelSpin){ soundReelSpin.loop=true; soundReelSpin.volume=0.35; playSound(soundReelSpin); }
  isSpinning=true; updateUI();
  const heldSnap=holds.slice();
  for(let i=0;i<NREELS;i++) if(!heldSnap[i]) currentReelsData[i]=genReel();
  runReels(heldSnap,hasAnticipation(),finalizeSpin);
}

function finalizeSpin(){
  holds=Array(NREELS).fill(false);
  isSpinning=false;

  if(invasionSpinsLeft>0){ dragonTick(); tipTick(); eventTick(); updateUI(); return; }

  /* przedmioty specjalne: maks. 1 błogosławieństwo na spin */
  let iceCubeCount=0, blessing=null, musicBoxFound=false, mbCell=null;
  for(let r=0;r<NREELS;r++) for(let c=0;c<NROWS;c++){
    const it=currentReelsData[r][c];
    if(!blessing && (it.isScarab||it.isBlueGem||it.isGoldRing||it.isEssence)) blessing=it;
    if(it.isMusicBox && !musicBoxFound){ musicBoxFound=true; mbCell=[r,c]; }
    if(it.isIce){ iceCubeCount++; iceCollectedThisRun++; }
    if(it.isCrystal){
      crystalCollected++;
      if(crystalCollected>=10 && boostSpinsLeft===0){
        crystalCollected=0; boostSpinsLeft=30; initAudio(); playSound(soundNpcReward); triggerNpcSpeech(translations.crystalBoostMsg);
      }
    }
  }
  if(musicBoxFound) cellEl(mbCell[0],mbCell[1]).classList.add('win-cell');
  if(blessing){
    if(blessing.isScarab){ scarabCharges=Math.min(scarabCharges+2,4); triggerFerumbrasBlessing("Scarab Amulet: +2 Ochrony Najazdu"); }
    else if(blessing.isBlueGem){ hasBlueGem=true; triggerFerumbrasBlessing("Blue Gem: -20% Szansy na Rajd"); }
    else if(blessing.isGoldRing){ goldRingActive=true; triggerFerumbrasBlessing("Gold Ring: 90% Szansy na Caosa!"); }
    else if(blessing.isEssence){ if(essenceCount<3) essenceCount++; triggerFerumbrasBlessing(`Demonic Essence: +${essenceCount*10}% do Wygranych!`); }
  }
  if(iceCubeCount>=4 || iceCollectedThisRun>=6){
    credits+=500; consecutiveLosses=0; iceCollectedThisRun=0; updateFireSpread();
    initAudio(); playSound(soundNpcReward); triggerNpcSpeech(translations.iceCubeBonusMsg);
  }

  /* liczenie WSZYSTKICH aktywnych linii: serie od lewej, min. 2 z rzędu */
  const active=allPaylines.slice(0,selectedLines);
  const bet=bets[currentBetIndex];
  let totalWin=0, bestItem=null, bestLine=0, bestCount=0, winningLines=0;
  const winningPaths=[];
  let mult=1+(boostSpinsLeft>0?0.5:0)+essenceCount*0.10+(dragonPhase===2?0.2:0);

  active.forEach(line=>{
    const first=currentReelsData[0][line.rows[0]];
    if(!(first.multiplier>0)) return;
    let k=1;
    while(k<NREELS && currentReelsData[k][line.rows[k]].name===first.name) k++;
    if(k>=2){
      const win=Math.floor(bet*first.multiplier*lenPay[k]*mult);
      totalWin+=win; winningLines++; winningPaths.push({line,count:k});
      if(win>bestLine){ bestLine=win; bestItem=first; bestCount=k; }
      for(let r=0;r<k;r++) cellEl(r,line.rows[r]).classList.add('win-cell');
    }
  });

  if(totalWin>0){
    winningPaths.forEach(({line,count})=>drawWinningPayline(line,count));
    playSound(consecutiveLosses>=5?soundResetFire:soundWin);
    consecutiveLosses=0; updateFireSpread();
    credits+=totalWin; updateHistoryUI(totalWin,`${bestCount}x ${bestItem.name}`);
    triggerNpcSpeech(`Wygrana! ${bestCount}x ${bestItem.name}${winningLines>1?` (+${winningLines} linii)`:''} (+${totalWin} CC)!`);
    triggerWinEffect(bestItem);
    if(totalWin>=25*bet*selectedLines) triggerHolly(totalWin,bet*selectedLines);
  } else {
    const oldF=Math.floor(consecutiveLosses/5); consecutiveLosses++;
    if(Math.floor(consecutiveLosses/5)>oldF) playSound(soundNewFire);
    updateFireSpread();
    if(--spinsToNextNpc<=0){ triggerNpcSpeech(); spinsToNextNpc=Math.floor(Math.random()*8)+5; }
    if(--spinsToNextNorma<=0){ triggerNormaSpeech(); spinsToNextNorma=Math.floor(Math.random()*31)+25; }
    if(!musicBoxFound && Math.random()<raidChance()) triggerRaid(Math.random()<0.35?'necro':'rotworm');
    const cc=caosChance(); if(goldRingActive) goldRingActive=false;
    if(!musicBoxFound && Math.random()<cc) triggerCaosAppearance();
  }
  if(musicBoxFound){ mbActive=true; setTimeout(openMusicBox,1200); }
  dragonTick(); tipTick(); eventTick();
  updateUI();
}


/* ---------- HOLLY CAOS ---------- */
const hollyQuotes=["Łaska Pana Caosa spływa na ciebie!","Caos widzi twoją wierność, śmiertelniku!","Dziś Pan Caos uśmiecha się do ciebie!","Poznaj łaskę Caosa – bogactwo dla wiernych!"];
function triggerHolly(win,cost){
  hollyActive=true; initAudio();
  const ov=document.getElementById('holly-overlay'), amt=document.getElementById('holly-amount'), sp=document.getElementById('caos-speech'), cc=document.getElementById('caos-container');
  document.getElementById('holly-mult').innerText=Math.round(win/cost);
  amt.innerText='0'; ov.classList.add('visible');
  sp.innerText=hollyQuotes[Math.floor(Math.random()*hollyQuotes.length)];
  cc.classList.add('visible');
  playSound(soundHolly); playSound(soundCoins); duck(true);
  const dur=3800, t0=performance.now();
  (function tick(now){ const p=Math.min(1,(now-t0)/dur); amt.innerText=Math.floor(win*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(tick); else amt.innerText=win; })(t0);
  setTimeout(()=>{
    ov.classList.remove('visible'); hollyActive=false;
    sp.innerText='BAD CAOS: BALANCE FROZEN';
    if(!raidActive&&!mbActive) duck(false);
    updateUI();
  },dur+1200);
}

/* ---------- SMOK ---------- */
const DRAGON_CHANCE=1/150;
const smellLines=["Czuć spalenizną w powietrzu... smok musi być blisko!","Pachnie dymem i siarką. Coś wielkiego krąży nad miastem...","Czujesz? Ktoś niedawno pluł ogniem. To pewnie smok!"];
function ferumbrasSay(text){
  const c=document.getElementById('ferumbras-container');
  document.getElementById('ferumbras-text').innerText=text;
  c.classList.add('visible');
  if(ferumbrasTimeout) clearTimeout(ferumbrasTimeout);
  ferumbrasTimeout=setTimeout(()=>c.classList.remove('visible'),9500);
}
function npcSay(who,text){ if(who===0) triggerNpcSpeech(text); else if(who===1) triggerNormaSpeech(text); else ferumbrasSay(text); }
function placeDragonFire(){
  const m=document.getElementById('slot-machine').getBoundingClientRect(), layer=document.getElementById('dragon-layer');
  layer.innerHTML='';
  const sp=[];
  for(let i=0;i<4;i++){ sp.push([m.left+(i+0.5)*m.width/4-40,m.top-55]); sp.push([m.left+(i+0.5)*m.width/4-40,m.bottom-35]); }
  for(let i=0;i<3;i++){ sp.push([m.left-65,m.top+(i+0.5)*m.height/3-45]); sp.push([m.right-15,m.top+(i+0.5)*m.height/3-45]); }
  sp.push([m.left-20,m.top-25]); sp.push([m.left-20,m.bottom-55]);
  sp.forEach((p,i)=>{
    const im=document.createElement('img'), sz=64+Math.floor(Math.random()*32);
    im.className='dfire'; im.src='ogien_smoka.gif'; im.onerror=function(){ this.onerror=null; this.src='fire-field-tibia.gif'; };
    im.style.width=sz+'px'; im.style.left=p[0]+'px'; im.style.top=p[1]+'px'; im.style.animationDelay=(i*0.15)+'s';
    layer.appendChild(im);
  });
  const d=document.getElementById('dragon'); d.style.left=(m.right-110)+'px'; d.style.top=(m.top-95)+'px';
}
function startDragonFire(){
  dragonPhase=2; dragonFireSpins=10;
  placeDragonFire();
  const d=document.getElementById('dragon'); d.style.display='block'; d.style.animation='none'; void d.offsetWidth; d.style.animation='';
  initAudio(); playSound(soundDragon);
  npcSay(Math.floor(Math.random()*3),"Smok podpalił maszynę! Ogień daje +20% do wygranych przez 10 spinów!");
}
function endDragonFire(){
  dragonPhase=0; dragonFireSpins=0;
  document.getElementById('dragon-layer').innerHTML='';
  document.getElementById('dragon').style.display='none';
  npcSay(Math.floor(Math.random()*3),"Ogień dogasa... smok odlatuje w siną dal.");
}
function dragonTick(){
  if(dragonPhase===2){ dragonFireSpins--; if(dragonFireSpins<=0) endDragonFire(); }
  else if(dragonPhase===1){ dragonCountdown--; if(dragonCountdown<=0) startDragonFire(); }
  else if(Math.random()<DRAGON_CHANCE){ dragonPhase=1; dragonCountdown=10; npcSay(Math.floor(Math.random()*3),smellLines[Math.floor(Math.random()*smellLines.length)]); }
}
window.addEventListener('resize',()=>{ if(dragonPhase===2) placeDragonFire(); if(monksActive) placeHalo(); });

/* ---------- PORADY NPC ---------- */
const tipPool=[
  {who:1,t:"Im wyższa stawka i więcej linii, tym chętniej potwory szturmują miasto!"},
  {who:1,t:"Blue Gem obniża szansę najazdu o 20%. Warto go mieć!"},
  {who:2,t:"Scarab Amulet gwarantuje zwycięstwo w najeździe. Strzeż go!"},
  {who:0,t:"HOLD zatrzymuje wybrane bębny. Przy dwóch pasujących symbolach to często dobry ruch!"},
  {who:2,t:"Gold Ring zwiększa szansę na Caosa do 90%, ale tylko na jeden spin."},
  {who:1,t:"Necromancerzy zabierają Błogosławieństwa. Odpieraj najazdy mądrze!"},
  {who:0,t:"Sześć Ice Cube'ów gasi ogień pecha i daje 500 CC!"},
  {who:1,t:"W najeździe masz 50% szans na właściwą kartę. Powodzenia!"},
  {who:2,t:"Demonic Essence zwiększa wygrane o 10% za sztukę, do 30%."},
  {who:0,t:"Wygrana warta 25 stawek przywoła Holly Caos!"},
  {who:2,t:"Czuję w tym miejscu moc Caosa... Nie lekceważ jej."},
  {who:1,t:"Turbo [T] i Auto-spin [A] oszczędzą ci czasu, jeśli się spieszysz."}
];
function tipTick(){
  if(tipBetCooldown>0) tipBetCooldown--;
  if(--spinsToNextTip<=0){ const t=tipPool[Math.floor(Math.random()*tipPool.length)]; npcSay(t.who,t.t); spinsToNextTip=12+Math.floor(Math.random()*10); }
}
function maybeBetTip(){
  if(tipBetCooldown>0) return;
  if((bets[currentBetIndex]>=50||selectedLines>=10) && Math.random()<0.6){
    triggerNormaSpeech("Uważaj! Przy wysokiej stawce i wielu liniach potwory mają na ciebie większą ochotę.");
    tipBetCooldown=12;
  }
}

/* ---------- TURBO i AUTO ---------- */
const autoOptions=[0,10,25,50];
function updateTurboBtn(){ const b=document.getElementById('turbo-btn'); if(b) b.innerText=turboOn?'⚡ WŁ':'⚡ WYŁ'; }
function updateAutoBtn(){ const b=document.getElementById('auto-btn'); if(b) b.innerText=autoSpinsLeft>0?`🔁 ${autoSpinsLeft}`:'🔁 WYŁ'; }
function toggleTurbo(){ initAudio(); playSound(soundClick); turboOn=!turboOn; updateTurboBtn(); }
function stopAuto(msg){ autoIdx=0; autoSpinsLeft=0; clearTimeout(autoTimer); updateAutoBtn(); if(msg) triggerNpcSpeech(msg); }
function autoKick(){ clearTimeout(autoTimer); autoTimer=setTimeout(autoNext,500); }
function cycleAuto(){
  initAudio(); playSound(soundClick);
  autoIdx=(autoIdx+1)%autoOptions.length; autoSpinsLeft=autoOptions[autoIdx]; updateAutoBtn();
  if(autoSpinsLeft>0) autoKick(); else clearTimeout(autoTimer);
}
function autoNext(){
  if(autoSpinsLeft<=0) return;
  if(!loggedIn||isSpinning||raidActive||mbActive||hollyActive||document.getElementById('info-modal').style.display==='flex'){ autoKick(); return; }
  const cost=bets[currentBetIndex]*selectedLines;
  if(credits<cost && caosFreezeSpinsLeft<=0){ stopAuto('Brak środków – auto-spin zatrzymany.'); return; }
  autoSpinsLeft--; if(autoSpinsLeft<=0) autoIdx=0;
  updateAutoBtn(); spin();
  if(autoSpinsLeft>0) autoKick();
}

/* ---------- MNISI, GOLEMY, PLOTKI (tylko widowisko, bez wpływu na szanse) ---------- */
function makeSprite(file,fallback,emoji,size,cls){
  const im=document.createElement('img'); im.className=cls; im.style.width=size+'px';
  im.onerror=function(){
    if(fallback&&!this.dataset.t){ this.dataset.t=1; this.src=fallback; return; }
    const sp=document.createElement('div'); sp.className=cls+' emoji'; sp.style.cssText=this.style.cssText; sp.style.fontSize=(size*0.8)+'px'; sp.style.height=size+'px'; sp.innerText=emoji; this.replaceWith(sp);
  };
  im.src=file; return im;
}
const machineRect=()=>document.getElementById('slot-machine').getBoundingClientRect();
function fadeClear(layerId){
  const l=document.getElementById(layerId); Array.from(l.children).forEach(c=>c.classList.add('fadeout'));
  setTimeout(()=>{ l.innerHTML=''; },1000);
}
/* Mnisi */
function darkSpell(){
  const m=machineRect(), mc=document.getElementById('slot-machine'), cx=m.left+m.width/2, cy=m.top+m.height/2;
  mc.classList.add('cursed','quake');
  for(let i=0;i<3;i++){
    const r=document.createElement('div'); r.className='spellring'; const sz=Math.max(m.width,m.height)*0.9;
    r.style.width=sz+'px'; r.style.height=sz+'px'; r.style.left=(cx-sz/2)+'px'; r.style.top=(cy-sz/2)+'px'; r.style.animationDelay=(i*0.25)+'s';
    document.body.appendChild(r); setTimeout(()=>r.remove(),2600);
  }
  const f=document.getElementById('spell-flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  setTimeout(()=>mc.classList.remove('quake'),1800);
}
function placeHalo(){
  const m=machineRect(), h=document.getElementById('holy-halo'), w=m.width*1.7, ht=m.height*1.5;
  h.style.width=w+'px'; h.style.height=ht+'px'; h.style.left=(m.left+m.width/2-w/2)+'px'; h.style.top=(m.top+m.height/2-ht/2)+'px';
}
function blessMachine(){
  const mc=document.getElementById('slot-machine'); mc.classList.remove('cursed'); mc.classList.add('blessed');
  placeHalo(); document.getElementById('holy-halo').style.display='block';
  document.querySelectorAll('#monk-layer .monk').forEach(x=>x.classList.add('holy'));
}
function startMonks(){
  monkDone=true; monksActive=true; initAudio();
  const m=machineRect(), L=document.getElementById('monk-layer'); L.innerHTML='';
  [[m.left-115,m.top+m.height*0.22],[m.left-115,m.top+m.height*0.58],[m.right+20,m.top+m.height*0.22],[m.right+20,m.top+m.height*0.58]].forEach((p,i)=>{
    const sp=makeSprite('monk.gif',null,'🧘',96,'monk'); sp.style.left=p[0]+'px'; sp.style.top=p[1]+'px'; sp.style.animationDelay=(i*0.15)+'s'; L.appendChild(sp);
  });
  triggerNormaSpeech("Czterej mnisi z klasztoru umacniają maszynę modlitwą. Ich pieśń potrwa pół minuty.");
  if(soundMonks){ soundMonks.currentTime=0; soundMonks.loop=true; soundMonks.volume=0.85; soundMonks.play().catch(()=>{}); }
  applyMusicVolume(); darkSpell();
  setTimeout(()=>{ if(monksActive) blessMachine(); },2600);
  setTimeout(()=>{ if(!soundMonks) return; const iv=setInterval(()=>{ soundMonks.volume=Math.max(0,soundMonks.volume-0.085); if(soundMonks.volume<=0) clearInterval(iv); },200); },28000);
  monkTimer=setTimeout(endMonks,30000);
  updateUI();
}
function endMonks(){
  monksActive=false; clearTimeout(monkTimer);
  const mc=document.getElementById('slot-machine'); mc.classList.remove('blessed','cursed','quake');
  document.getElementById('holy-halo').style.display='none';
  fadeClear('monk-layer');
  if(soundMonks){ soundMonks.pause(); soundMonks.loop=false; soundMonks.volume=0.85; }
  applyMusicVolume();
  triggerNpcSpeech("Mnisi kończą medytację i odchodzą w ciszy.");
  updateUI();
}
/* War Golemy i teleport Ferumbrasa */
const GOLEM_STEPS=40;
function startGolems(){
  golemDone=true; golemActive=true; golemProgress=0;
  const m=machineRect(), L=document.getElementById('golem-layer'); L.innerHTML='';
  [[m.left+m.width*0.08,m.bottom+16],[m.left+m.width*0.42,m.bottom+20],[m.left+m.width*0.76,m.bottom+16]].forEach((p,i)=>{
    const sp=makeSprite('war_golem.gif','golem.gif','🤖',126,'golem'); sp.style.left=p[0]+'px'; sp.style.top=Math.min(p[1],window.innerHeight-126-8)+'px'; sp.style.animationDelay=(i*0.2)+'s'; L.appendChild(sp);
  });
  ferumbrasSay("Moje War Golemy montują mechanizm przy maszynie... Ładowanie potrwa.");
  chargeFx(); scheduleLightning();
  updateUI();
}
function addGear(i){
  const m=machineRect(), L=document.getElementById('golem-layer');
  /* 1: beczki/kocioł (lewy bok), 2: złota armata (prawy bok), 3: wieża z kulą (lewy górny róg) */
  const cfg=[{x:m.left-125,y:m.bottom-165,sz:115},{x:m.right+10,y:m.bottom-150,sz:105},{x:m.left-120,y:m.top-125,sz:135}][i];
  const sp=makeSprite('sprzet'+(i+1)+'.png','sprzet'+(i+1)+'.gif',['⚙️','🔧','🔮'][i],cfg.sz,'gear');
  sp.style.left=Math.max(0,cfg.x)+'px'; sp.style.top=Math.max(0,cfg.y)+'px'; sp.style.zIndex=16; L.appendChild(sp);
}
function openPortal(){
  const m=machineRect(), p=document.getElementById('portal');
  p.style.left=(m.left+m.width/2-75)+'px'; p.style.top=Math.max(4,m.top-215)+'px'; p.style.display='block';
  initAudio(); playSound(soundBlessingMusic);
  const f=document.getElementById('spell-flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
function endGolems(){
  clearTimeout(lightningTimer);
  document.getElementById('portal').style.display='none'; fadeClear('golem-layer');
}
function finishGolems(){
  golemActive=false;
  ferumbrasSay(ferumbrasSuccess?"Teraz! Pełne ładowanie! Exori Vis Benedictio!":"Ładuję całą mocą... ostrożnie...");
  chargeFx(); setTimeout(strikeAtGear,700); setTimeout(strikeAtGear,1500);
  setTimeout(()=>{
    if(ferumbrasSuccess){
      ferumbrasSay("Maszyna naładowana! Otwieram teleport!");
      openPortal(); setTimeout(endGolems,9000);
    } else {
      document.querySelectorAll('#golem-layer .gear').forEach(g=>g.classList.add('broken'));
      strikeAtGear(); setTimeout(strikeAtGear,300);
      ferumbrasSay("Przeciążenie! Mechanizm nie wytrzymał... Spróbujemy innym razem.");
      setTimeout(endGolems,3500);
    }
    updateUI();
  },2800);
}
function golemStep(){
  golemProgress++;
  if(golemProgress===13||golemProgress===26||golemProgress===39){
    addGear(golemProgress/13-1); chargeFx(); setTimeout(strikeAtGear,900);
    ferumbrasSay(["Pierwsza część mechanizmu na miejscu. Ładuję!","Druga część zamontowana. Energia rośnie!","Ostatni element! Jeszcze chwila ładowania..."][golemProgress/13-1]);
  }
  if(golemProgress>=GOLEM_STEPS) finishGolems();
}
/* ---------- ŁADOWANIE MASZYNY PRZEZ FERUMBRASA + PIORUNY ---------- */
const SVGNS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs){ const e=document.createElementNS(SVGNS,tag); for(const k in attrs) e.setAttribute(k,attrs[k]); return e; }
function chargeFx(){
  initAudio(); playSound(soundCharge);
  const fr=document.getElementById('ferumbras-container').getBoundingClientRect(), m=machineRect();
  const x1=140, y1=fr.top+fr.height*0.45, x2=m.left+m.width/2, y2=m.top+m.height/2;
  const g=svgEl('g',{}); document.getElementById('fx-g').appendChild(g);
  g.appendChild(svgEl('line',{x1,y1,x2,y2,stroke:'url(#beamGrad)','stroke-width':12,'stroke-linecap':'round',filter:'url(#glow)',class:'beam',opacity:.85}));
  g.appendChild(svgEl('line',{x1,y1,x2,y2,stroke:'#fff','stroke-width':3,opacity:.9}));
  const path=`M${x1} ${y1} L${x2} ${y2}`;
  for(let i=0;i<4;i++){
    const c=svgEl('circle',{r:8,fill:'#e6ccff',filter:'url(#glow)'});
    const a=svgEl('animateMotion',{dur:'0.7s',repeatCount:'4',begin:(i*0.17)+'s',path});
    c.appendChild(a); g.appendChild(c);
  }
  const src=svgEl('circle',{cx:x1,cy:y1,r:14,fill:'none',stroke:'#b388ff','stroke-width':4,filter:'url(#glow)'});
  src.appendChild(svgEl('animate',{attributeName:'r',from:12,to:48,dur:'0.6s',repeatCount:'4'}));
  src.appendChild(svgEl('animate',{attributeName:'opacity',from:1,to:0,dur:'0.6s',repeatCount:'4'}));
  g.appendChild(src);
  const mc=document.getElementById('slot-machine'); mc.classList.add('charging');
  for(let i=0;i<2;i++){
    const r=document.createElement('div'); r.className='chargering'; const sz=Math.max(m.width,m.height)*0.8;
    r.style.width=sz+'px'; r.style.height=sz+'px'; r.style.left=(x2-sz/2)+'px'; r.style.top=(y2-sz/2)+'px'; r.style.animationDelay=(i*0.9)+'s';
    document.body.appendChild(r); setTimeout(()=>r.remove(),2400);
  }
  setTimeout(()=>{ g.remove(); mc.classList.remove('charging'); },2800);
}
let lightningTimer=null;
function strikeAtGear(){
  const L=document.getElementById('golem-layer');
  let targets=Array.from(L.querySelectorAll('.gear')); if(!targets.length) targets=Array.from(L.querySelectorAll('.golem'));
  if(!targets.length) return;
  const t=targets[Math.floor(Math.random()*targets.length)], r=t.getBoundingClientRect();
  const tx=r.left+r.width/2, ty=r.top+r.height/2;
  let x=tx+(Math.random()*160-80), y=Math.max(0,r.top-280); const pts=[[x,y]]; const steps=8;
  for(let i=1;i<=steps;i++){ const p=i/steps; pts.push([x+(tx-x)*p+(i<steps?Math.random()*40-20:0), y+(ty-y)*p]); }
  const str=pts.map(p=>p.join(',')).join(' '), g=svgEl('g',{class:'bolt'});
  g.appendChild(svgEl('polyline',{points:str,fill:'none',stroke:'#8ecbff','stroke-width':9,opacity:.55,filter:'url(#glow)','stroke-linejoin':'round'}));
  g.appendChild(svgEl('polyline',{points:str,fill:'none',stroke:'#fff','stroke-width':3,'stroke-linejoin':'round'}));
  const b=pts[4]; g.appendChild(svgEl('polyline',{points:`${b[0]},${b[1]} ${b[0]+30+Math.random()*30},${b[1]+40} ${b[0]+10+Math.random()*50},${b[1]+80}`,fill:'none',stroke:'#cfeaff','stroke-width':2}));
  document.getElementById('fx-g').appendChild(g);
  initAudio(); playSound(soundLightning);
  t.classList.add('zap'); setTimeout(()=>t.classList.remove('zap'),220);
  setTimeout(()=>g.remove(),500);
}
function scheduleLightning(){
  clearTimeout(lightningTimer);
  lightningTimer=setTimeout(()=>{ strikeAtGear(); scheduleLightning(); },3000+Math.random()*4000);
}

/* Plotki Normy */
const rumors=[
  "Plotka: widziano necromancerów kopiących głębokie doły za miastem...",
  "Plotka: handlarze mówią, że necromancerzy skupują wszystkie kości w okolicy.",
  "Plotka: nocą z krypt dochodzi miarowy stukot, jakby ktoś szył zbroje.",
  "Plotka: ktoś widział długie kolumny nieumarłych maszerujących na wschód.",
  "Plotka: necromancerzy budują armię, ale nikt nie wie po co.",
  "Plotka: Ferumbras ponoć wie więcej, niż mówi. Zapytaj go... jeśli się odważysz.",
  "Plotka: podobno armia czeka na jakiś znak. Może od samego Caosa?",
  "Plotka: mnisi z klasztoru modlą się za nas, bo wiedzą, że coś się zbliża."
];
function eventTick(){
  sessionSpins++;
  const free=!(raidActive||mbActive||hollyActive);
  if(!monkDone && sessionSpins>=monkSpin && free && !golemActive) startMonks();
  if(!golemDone && sessionSpins>=golemSpin && free && !monksActive) startGolems();
  else if(golemActive) golemStep();
  if(--spinsToNextRumor<=0){
    triggerNormaSpeech(rumors[rumorIdx<rumors.length?rumorIdx:Math.floor(Math.random()*rumors.length)]); rumorIdx++;
    spinsToNextRumor=25+Math.floor(Math.random()*16);
  }
}
window.addEventListener('mousemove',e=>{
  const m=document.getElementById('slot-machine'); if(!m) return;
  m.style.setProperty('--ry',((e.clientX/window.innerWidth-0.5)*7).toFixed(2)+'deg');
  m.style.setProperty('--rx',(2-(e.clientY/window.innerHeight-0.5)*5).toFixed(2)+'deg');
});

renderReels(); updateUI();
window.addEventListener('keydown',e=>{
  if(!loggedIn) return;
  if(mbActive){ if(e.code==='Space') e.preventDefault(); if(e.key==='1') pickMbCard(0); if(e.key==='2') pickMbCard(1); return; }
  if(raidActive){ if(e.code==='Space') e.preventDefault(); if(e.key==='1') pickRaidCard(0); if(e.key==='2') pickRaidCard(1); return; }
  if(e.code==='Space'){ e.preventDefault(); spin(); }
  if(e.key>='1'&&e.key<='6') toggleHold(parseInt(e.key)-1);
  const k=e.key.toLowerCase();
  if(k==='c') changeBet(); if(k==='l') changeLines(); if(k==='r') resetCredits(); if(k==='i') toggleInfoModal(); if(k==='m') toggleMusic(); if(k==='t') toggleTurbo(); if(k==='a') cycleAuto();
});

/* ---------- ZDARZENIA (zamiast onclick/oninput: Discord blokuje inline handlery) ---------- */
(function bindEvents(){
  const $=id=>document.getElementById(id);
  const pin=$('pin-input');
  pin.addEventListener('input',onPinInput);
  pin.addEventListener('keydown',e=>{ if(e.key==='Enter') tryLogin(); });
  $('music-btn').addEventListener('click',toggleMusic);
  $('turbo-btn').addEventListener('click',toggleTurbo);
  $('auto-btn').addEventListener('click',cycleAuto);
  $('close-info-btn').addEventListener('click',toggleInfoModal);
  for(let i=0;i<2;i++){
    $('raid-card-'+i).addEventListener('click',()=>pickRaidCard(i));
    $('mb-card-'+i).addEventListener('click',()=>pickMbCard(i));
  }
  for(let r=0;r<NREELS;r++) $('hold'+(r+1)).addEventListener('click',()=>toggleHold(r));
  bets.forEach((b,i)=>$('badge-'+b).addEventListener('click',()=>setBet(i)));
  lineOptions.forEach((n,i)=>$('lbadge-'+n).addEventListener('click',()=>setLines(i)));
  /* zapasowe obrazki (onerror) */
  const onFail=(img,fn)=>{ if(!img) return; img.addEventListener('error',()=>fn(img)); if(img.complete&&img.naturalWidth===0) fn(img); };
  onFail($('login-probe'),im=>{ if(!im.dataset.t){ im.dataset.t=1; im.src='ekran%20logowania.png'; } else $('login-fallback').style.display='block'; });
  onFail($('ferumbras-img'),im=>{ im.src='rashid-tibia.gif'; });
  onFail($('caos-img'),im=>{ if(!im.dataset.t){ im.dataset.t=1; im.src='caos.gif'; } else im.src='rashid-tibia.gif'; });
  onFail($('dragon'),im=>{ if(!im.dataset.t){ im.dataset.t=1; im.src='dragon.gif'; } else im.style.visibility='hidden'; });
})();

/* ---------- DISCORD ACTIVITY ---------- */
const DISCORD_CLIENT_ID='1563040130246377574';
(function initDiscordActivity(){
  /* Discord otwiera Activity z parametrem frame_id; w zwykłej przeglądarce nic się nie zmienia */
  if(!/[?&]frame_id=/.test(location.search)) return;
  /* w Discordzie od razu pomijamy ekran PIN, nie czekając na SDK */
  loggedIn=true;
  const ls=document.getElementById('login-screen'); if(ls) ls.style.display='none';
  initAudio(); updateUI();
  window.addEventListener('pointerdown',()=>startMusic(),{once:true});
  /* SDK bywa kapryśne (np. konto bez awatara), więc jego błędy nie mogą blokować gry */
  try{
    const sdk=new DiscordSDK.DiscordSDK(DISCORD_CLIENT_ID);
    sdk.ready().catch(e=>console.warn('Discord SDK:',e));
  }catch(e){ console.warn('Discord SDK:',e); }
})();
