const app=document.getElementById('app');
let xp=+(localStorage.umamiXP||0),best=+(localStorage.umamiBest||0);
function save(){localStorage.umamiXP=xp;localStorage.umamiBest=best;document.getElementById('xp').textContent=String(xp).padStart(3,'0');document.getElementById('level').textContent=String(Math.floor(xp/250)+1).padStart(2,'0')}
function home(){location.reload()}
function scores(){app.innerHTML=`<section class="screen"><button class="back" id="back">← MAIN MENU</button><h2>HIGH SCORES</h2><p class="question">${xp} TOTAL XP</p><p>Personal best session: ${best} XP</p><p class="feedback">Local demo only: scores are stored in this browser and do not sync between employees or devices.</p><button id="reset">RESET LOCAL SCORE</button></section>`;document.getElementById('back').onclick=home;document.getElementById('reset').onclick=()=>{if(confirm('Reset local demo scores?')){xp=best=0;save();scores()}}}

/* Original synthesized chiptune. Melody uses a pentatonic palette with a plucked, koto-like timbre. */
let audioCtx=null,master=null,musicTimer=null,musicOn=false,track='menu',step=0,nextBeat=0;
const tracks={
 menu:{bpm:112,melody:[69,null,72,74,76,null,74,72,69,null,72,76,79,null,76,74,72,null,74,76,81,null,79,76,74,null,72,69,67,null,69,null],bass:[45,45,52,45,43,43,50,43]},
 battle:{bpm:138,melody:[69,72,76,79,76,72,74,76,81,79,76,74,72,76,79,84,81,79,76,72,74,76,79,76,72,69,72,74,76,72,69,67],bass:[45,45,48,50,43,43,50,52]}
};
function tone(freq,start,duration,wave,volume){const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain);gain.connect(master);osc.start(start);osc.stop(start+duration+.025)}
function midi(n){return 440*Math.pow(2,(n-69)/12)}
function kick(t){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(115,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(master);o.start(t);o.stop(t+.15)}
function noise(t){const len=Math.floor(audioCtx.sampleRate*.07),buf=audioCtx.createBuffer(1,len,audioCtx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=audioCtx.createBufferSource(),g=audioCtx.createGain();src.buffer=buf;g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.065);src.connect(g);g.connect(master);src.start(t)}
function schedule(){if(!audioCtx||!musicOn)return;const song=tracks[track],interval=60/song.bpm/2;while(nextBeat<audioCtx.currentTime+.16){const n=step%song.melody.length,mel=song.melody[n];if(mel!==null)tone(midi(mel),nextBeat,.19,'square',.075);if(step%4===0){const bass=song.bass[Math.floor(step/4)%song.bass.length];tone(midi(bass),nextBeat,.28,'triangle',.11)}if(step%8===0)kick(nextBeat);else if(step%8===4)noise(nextBeat);if(step%2===1&&mel!==null)tone(midi(mel+12),nextBeat,.07,'triangle',.022);nextBeat+=interval;step++}}
async function startMusic(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audioCtx=audioCtx||new AC();await audioCtx.resume();if(!master){master=audioCtx.createGain();master.gain.value=.42;master.connect(audioCtx.destination)}musicOn=true;step=0;nextBeat=audioCtx.currentTime+.04;if(musicTimer)clearInterval(musicTimer);musicTimer=setInterval(schedule,25);syncMusicButton()}
function stopMusic(){musicOn=false;if(musicTimer)clearInterval(musicTimer);musicTimer=null;syncMusicButton()}
function syncMusicButton(){const b=document.getElementById('musicToggle');if(b){b.textContent=musicOn?'♫ MUSIC: ON':'♫ MUSIC: OFF';b.setAttribute('aria-pressed',String(musicOn))}}
function setTrack(next){if(track===next)return;track=next;if(musicOn){step=0;nextBeat=audioCtx.currentTime+.04}}
function sfx(kind){if(!audioCtx||!musicOn)return;const t=audioCtx.currentTime;if(kind==='correct'){tone(midi(76),t,.12,'square',.12);tone(midi(81),t+.11,.18,'square',.12)}else{tone(midi(55),t,.18,'triangle',.09)}}
document.getElementById('musicToggle').onclick=()=>musicOn?stopMusic():startMusic();

async function quiz(mode){
  setTrack(mode==='academy'?'menu':'battle');
  let data;
  try{const response=await fetch(mode==='academy'?'data/questions.json':'data/upselling.json');if(!response.ok)throw new Error('Question file unavailable');data=await response.json()}
  catch(e){app.innerHTML='<section class="screen"><button class="back" onclick="location.reload()">← MAIN MENU</button><h2>QUEST DATA ERROR</h2><p>Could not load this challenge. Check your connection and try again.</p></section>';return}
  let i=0,earned=0;
  function draw(){
    const q=data[i];
    app.innerHTML=`<section class="screen"><button class="back" id="back">← MAIN MENU</button><div class="meta"><span>${mode==='academy'?'RAMEN ACADEMY':'GUEST BATTLE'}</span><span>CHALLENGE ${i+1}/${data.length}</span></div><h2>${mode==='academy'?'MENU KNOWLEDGE':'CUSTOMER ENCOUNTER'}</h2>${q.guest?`<p>${q.guest}</p>`:''}<p class="question">${q.q}</p><div class="answers">${q.choices.map((a,n)=>`<button class="answer" data-a="${n}">${'ABCD'[n]}. ${a}</button>`).join('')}</div><div id="feedback"></div><p class="meta">SESSION XP: ${earned} · TOTAL XP: ${xp}</p></section>`;
    document.getElementById('back').onclick=home;
    document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>answer(+b.dataset.a,q));
  }
  function answer(n,q){
    const ok=n===q.correct;
    if(ok){earned+=50;xp+=50;best=Math.max(best,earned);save();sfx('correct')}else sfx('wrong');
    document.querySelectorAll('.answer').forEach((b,j)=>{b.disabled=true;if(j===q.correct)b.classList.add('correct');else if(j===n)b.classList.add('wrong')});
    document.getElementById('feedback').innerHTML=`<div class="feedback"><b>${ok?'CORRECT · +50 XP':'NOT QUITE'}</b><br>${q.why}</div><p><button id="next">${i===data.length-1?'VIEW RESULTS':'NEXT QUESTION'} ▶</button></p>`;
    document.getElementById('next').onclick=()=>{i++;if(i<data.length)draw();else result()};
  }
  function result(){app.innerHTML=`<section class="screen"><button class="back" id="back">← MAIN MENU</button><h2>QUEST COMPLETE</h2><p class="question">${earned} XP EARNED</p><p>You completed ${data.length} challenges.</p><button id="again">PLAY AGAIN ↻</button></section>`;document.getElementById('back').onclick=home;document.getElementById('again').onclick=()=>quiz(mode)}
  draw();
}
document.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>b.dataset.screen==='scores'?scores():quiz(b.dataset.screen));
save();
