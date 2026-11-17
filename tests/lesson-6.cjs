// Run with PLAYWRIGHT_MODULE pointing at an installed Playwright package.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const base=process.env.TEST_BASE_URL||'http://localhost:8766/';
await page.goto(base);await page.evaluate(()=>{localStorage.setItem('l4-practice-v1',JSON.stringify({sentinel:{n:9}}));localStorage.setItem('l5-practice-v1',JSON.stringify({sentinel:{n:7}}));});
assert.equal(await page.locator('nav a[href="lesson-6/"]').count(),1);
await page.goto(base+'lesson-5/');assert.equal(await page.locator('nav a[href="../lesson-6/"]').count(),1);
await page.goto(base+'lesson-6/');
assert.equal(await page.title(),'Lesson 6 Vocab Quiz · Practice');
await page.waitForFunction(()=>typeof HanziWriter!=='undefined'&&!!window.HZ);
const noOverflow=async(label)=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow: '+label);
await noOverflow('home');

// ---- Data integrity ----
const d=await page.evaluate(()=>({W:WRITE.length,S:SENT.length,O:ORDER.length,ST:STEPS.length,TR:TR.length,B:BUILD.length,
 words:WRITE.map(w=>w.h).join('，'),
 noHZ:[...WRITE.map(w=>w.h).join(''),...SENT.map(s=>s.h).join('')].filter(c=>!isPunct(c)&&!HZ[c]),
 py:WRITE.every(w=>gradePy(w.p,w).score===1),
 tilesMatch:ORDER.filter(o=>tilesOf(o).map(x=>x[0]).join('')!==o.h.replace(/[，。？！、,.?! ]/g,'')).map(o=>o.id),
 badVariants:ORDER.filter(o=>orderVariants(o).some(v=>v.includes(-1)||new Set(v).size!==tilesOf(o).length)).map(o=>o.id),
 ids:new Set(ORDER.map(o=>o.id)).size===ORDER.length,
 perPat:Object.keys(PATS).map(k=>ORDER.filter(o=>o.pat===k).length),
 unknownPat:ORDER.filter(o=>!PATS[o.pat]).length,
 slots:ORDER.every(o=>tilesOf(o).every(x=>SL[x[1]]!==undefined)),
 units:UNITS.map((u,i)=>STEPS.filter(s=>s.u===i).length),
 stepRefs:STEPS.every(s=>s.q.k==='mc'?s.q.o[s.q.a]!==undefined:!!ORDER.find(o=>o.id===s.q.id)),
 exSlots:STEPS.every(s=>s.ex.every(x=>parseC(x.c).every(c=>SL[c[1]]!==undefined))),
 trMatchesSelf:TR.every(t=>[t.a,...(t.acc||[])].every(a=>normZh(a).length>0)),
 hasDialogue2:[...WRITE.map(w=>w.h)].includes('见面')}));
assert.equal(d.W,43);assert.equal(d.S,8);assert.ok(d.O>=40,'40+ word-order items');assert.equal(d.ST,33);assert.ok(d.TR>=30);
assert.equal(d.words,'打电话，给，喂，您，就，哪，位，时间，上，下，上课，下课，上个星期，下个星期，上上个星期，下下个星期，以后，空儿，有空，方便，节，门，课，年级，考试，小考，开会，问，问题，没问题，办公室，要是，等，到，行，别，别客气，去年，今年，明年，上午，中午，下午');
assert.deepEqual(d.noHZ,[]);assert.equal(d.py,true);assert.deepEqual(d.tilesMatch,[]);assert.deepEqual(d.badVariants,[]);assert.equal(d.ids,true);
assert.ok(d.perPat.every(n=>n>=3),'every pattern has 3+ word-order items');assert.equal(d.unknownPat,0);assert.equal(d.slots,true);
assert.ok(d.units.every(n=>n>=1));assert.equal(d.stepRefs,true);assert.equal(d.exSlots,true);assert.equal(d.trMatchesSelf,true);assert.equal(d.hasDialogue2,false);

// ---- Pinyin variants ----
assert.equal(await page.evaluate(()=>{const g=(p,h)=>gradePy(p,WRITE.find(w=>w.h===h)).score;
 return [['wei2','喂'],['wei4','喂'],['na3','哪'],['nei3','哪'],['kong4r','空儿'],['kong4','空儿'],['kong4 er5','空儿'],['you3kong4r','有空'],['shang4 ge xing1qi1','上个星期'],['shang4ge4xing1qi1','上个星期'],['shang4ge5xing1qi1','上个星期'],['bie2ke4qi0','别客气'],['ban4gong1shi4','办公室'],['bàngōngshì','办公室'],['yao4shi5','要是'],['kao3shi4','考试']].every(([p,h])=>g(p,h)===1)&&g('ban1gong1shi4','办公室')===0.5&&g('wrong','办公室')===0;}),true);

// ---- Word-order acceptance and slot hints ----
const wo=await page.evaluate(()=>{const it=id=>ORDER.find(o=>o.id===id),acc=(id,s)=>orderAccepts(it(id),s);
 const ord=(id,txt)=>{const t=tilesOf(it(id)),used=new Set();return txt.split(' ').map(x=>{const k=t.findIndex((y,j)=>y[0]===x&&!used.has(j));used.add(k);return k;});};
 const hint=(id,txt)=>orderHint(it(id),ord(id,txt));
 return {
  all:ORDER.every(o=>orderAccepts(o,tilesOf(o).map(x=>x[0]).join(''))),
  swapTS:acc('o2','我明天上午在教室等你'),swapST:acc('o69','今天我没喝咖啡'),
  yaoshiAlt:acc('o44','你要是有空儿我们去吃中国菜吧'),twoSwaps:acc('o46','您要是方便我四点半到您的办公室去行吗'),
  rejectEnglish:acc('o2','我等你在教室明天上午'),rejectLe:acc('o66','王朋和李友晚上十二点才回家了'),
  hTime:hint('o2','我 等 你 在 教室 明天上午'),hGei:hint('o18','妈妈 打 电话 给 孩子'),hObj:hint('o10','我 一 杯 冰水 要'),
  hDur:hint('o34','我 一个星期 五天 学 中文'),hEnd:hint('o48','我 在 图书馆 等 行吗 你'),hInside:hint('o1','我 办公室 在 等 你'),hHelper:hint('o20','老师 明天 给 妈妈 要 打电话')};});
assert.equal(wo.all,true);assert.equal(wo.swapTS,true);assert.equal(wo.swapST,true);assert.equal(wo.yaoshiAlt,true);assert.equal(wo.twoSwaps,true);
assert.equal(wo.rejectEnglish,false);assert.equal(wo.rejectLe,false);
assert.equal(wo.hTime.slot,'T');assert.match(wo.hTime.msg,/明天上午[\s\S]*time[\s\S]*after the verb[\s\S]*等/i);
assert.equal(wo.hGei.slot,'P');assert.match(wo.hGei.msg,/给[\s\S]*after the verb/);
assert.equal(wo.hObj.slot,'O');assert.match(wo.hObj.msg,/in front of the verb[\s\S]*要/);
assert.equal(wo.hDur.slot,'D');assert.match(wo.hDur.msg,/how-long[\s\S]*in front of the verb/i);
assert.equal(wo.hEnd.slot,'E');assert.match(wo.hEnd.msg,/very end/);
assert.equal(wo.hInside.slot,'P');assert.match(wo.hInside.msg,/out of place/);
assert.equal(wo.hHelper.slot,'H');assert.match(wo.hHelper.msg,/要/);

// ---- A · Sentence structure: walk all 33 steps, answering each check ----
await page.evaluate(()=>structure());await noOverflow('structure');
for(let i=0;i<33;i++){
 await page.evaluate(i=>step(i),i);await noOverflow('step '+(i+1));
 const q=await page.evaluate(i=>STEPS[i].q,i);
 if(q.k==='mc'){await page.click(`#qc [data-o="${q.a}"]`);assert.match(await page.locator('#qfb').textContent(),/Right/);}
 else{
  if(i===3){ // first order check: try English order first to see the slot hint, then fix it
   for(const x of ['常老师','等','李友','在','办公室'])await page.locator('#qc .bank .tile',{hasText:new RegExp('^'+x+'$')}).first().tap();
   await page.click('#qc [data-act=check]');assert.match(await page.locator('#qc .owfb').textContent(),/out of place|verb/);await page.click('#qc [data-act=clear]');
  }
  const words=await page.evaluate(id=>tilesOf(ORDER.find(o=>o.id===id)).map(x=>x[0]),q.id);
  for(const x of words)await page.locator('#qc .bank .tile',{hasText:new RegExp('^'+x+'$')}).first().tap();
  await page.click('#qc [data-act=check]');assert.match(await page.locator('#qc .owfb').textContent(),/Correct|Got it/);
 }
 await page.waitForSelector('#nav button');
}
assert.equal(await page.evaluate(()=>stepsDone()),33);

// ---- C · Word order mode ----
await page.evaluate(()=>{opat='yaoshi';wordOrder();});await noOverflow('word order');
const it=await page.evaluate(()=>({id:lastO.id,w:tilesOf(lastO).map(x=>x[0]),p:lastO.p,en:lastO.en,s0:(M[lastO.id+'|order']||{s:0}).s}));
for(const x of it.w)await page.locator('#ow .bank .tile',{hasText:new RegExp('^'+x+'$')}).first().tap();
await page.click('#ow [data-act=check]');const fbt=await page.locator('#ow .owfb').textContent();assert.ok(fbt.includes(it.p)&&fbt.includes(it.en),'pinyin + English shown after solving');
assert.equal(await page.evaluate(id=>M[id+'|order'].s,it.id),it.s0+1);await page.click('#nx');
await page.click('#ow [data-act=col]');assert.ok(await page.locator('#ow .legend').count());await page.locator('#ow .bank .tile').first().tap();await page.locator('#ow .ans .tile').first().tap();assert.equal(await page.locator('#ow .ans .tile').count(),0);

// ---- D · Slot builder ----
await page.evaluate(()=>slotBuilder());await noOverflow('slot builder');
const sb=await page.evaluate(()=>{const f=(s,t,hh,p,v)=>{Object.assign(sbs,{S:s,T:t,H:hh,P:p,V:v});return sbCompose();};
 const a=f(2,4,4,6,1),b=f(0,0,3,1,0),c=f(3,3,5,4,0),e=f(1,1,0,0,4);
 sbs.S=0;sbPick('H',6);const bie=sbCompose(),bieS=SB.S[sbs.S].z;sbPick('P',4);const giveV=SB.V[sbs.V].v;
 return {a:[a.hz,a.es],b:[b.hz,b.py],c:[c.hz,c.es],e:[e.hz,e.es],bie:[bie.hz,bie.es],bieS,giveV};});
assert.deepEqual(sb.a,['李友下课以后常常到图书馆去看书。','Li You often goes to the library to read books after class.']);
assert.deepEqual(sb.b,['我不在图书馆打电话。','Wǒ bú zài túshūguǎn dǎ diànhuà.']);
assert.deepEqual(sb.c,['常老师四点以后才给妈妈打电话。','Teacher Chang doesn’t call Mom until after four o’clock.']);
assert.deepEqual(sb.e,['你今天下午喝咖啡。','You drink coffee this afternoon.']);
assert.equal(sb.bieS,'你');assert.match(sb.bie[1],/^Don’t /);assert.equal(sb.giveV,'打');
await page.click('.choice.s-T button:nth-child(3)');assert.match(await page.locator('#sb .ex').textContent(),/明天上午/);await noOverflow('slot builder after click');

// ---- B · Word building ----
await page.evaluate(()=>buildHome());await noOverflow('build home');
for(let i=0;i<await page.evaluate(()=>BUILD.length);i++){await page.evaluate(i=>buildLearn(i),i);await noOverflow('build card '+i);}
await page.evaluate(()=>buildQuiz());await noOverflow('build quiz');
const bw=await page.evaluate(()=>lastB.w);
for(const c of [...bw])await page.locator('#bank .tile',{hasText:c}).first().tap();
await page.click('#chk');assert.match(await page.locator('#fb').textContent(),/Right/);assert.equal(await page.evaluate(w=>M[w+'|build'].s,bw),1);
await page.click('#chk');await page.locator('#bank .tile').first().tap();await page.locator('#slots .slotbox.f').first().tap();assert.equal(await page.locator('#slots .slotbox.f').count(),0);
await page.evaluate(()=>families());await noOverflow('families');

// ---- E · Translate ----
await page.evaluate(()=>{lastT=TR[0];translate();});await noOverflow('translate');
const tr=await page.evaluate(()=>lastT.a);await page.fill('#zh',tr);await page.click('#hint');assert.match(await page.locator('#hb').textContent(),/Pattern/);
await page.click('#show');assert.match(await page.locator('#fb').textContent(),/matches/);await page.click('#y');await page.click('#nx');
await page.fill('#zh','我不知道');await page.click('#show');assert.match(await page.locator('#fb').textContent(),/Not an exact match/);await page.click('#n');

// ---- Standard modes (as Lesson 5) ----
await page.evaluate(()=>{window.testWriters=[];const original=makeWriter;makeWriter=function(...a){const w=original(...a);testWriters.push(w);return w;};});
await page.evaluate(()=>learn(WRITE.find(w=>w.h==='时间')));await page.waitForSelector('.tian svg');await page.click('#replay');await page.click('#go');
for(let n=1;n<=5;n++){
 await page.waitForFunction(n=>document.querySelector('.pill')?.textContent.includes(`Copy ${n} of 5`),n);
 await page.waitForTimeout(150);
 for(let j=0;j<3;j++){await page.evaluate(()=>{for(const w of testWriters.slice(-2))while(w._quiz?._isActive)w.skipQuizStroke();});await page.waitForTimeout(350);}
}
await page.waitForSelector('#again');assert.match(await page.locator('h2').textContent(),/Locked in/);
await page.evaluate(()=>recog());await page.fill('#py',await page.evaluate(()=>lastR.p));await page.fill('#en',await page.evaluate(()=>lastR.e[0]));await page.click('#chk');assert.match(await page.locator('#fb').textContent(),/✓ Pinyin/);
await page.evaluate(()=>writing());await page.click('#hint');await page.click('#show');await page.waitForTimeout(200);await page.click('#skip');
await page.waitForTimeout(200);
// Draw 上 (three strokes) with real touch events along its bundled medians.
await page.evaluate(()=>{live.forEach(q=>q.cancel());window.touchDone=false;window.touchQuiz=quizSeq(document.querySelector('#q'),['上'],{onDone:()=>window.touchDone=true});});
await page.waitForTimeout(200);
await page.evaluate(async()=>{const el=document.querySelector('.tian.active svg');const b=el.getBoundingClientRect();const size=b.width,pad=Math.round(size*.06),scale=(size-2*pad)/1024;
 for(const points of HZ['上'].medians){const point=([x,y])=>new Touch({identifier:7,target:el,clientX:b.x+pad+x*scale,clientY:b.y+pad+(900-y)*scale});
  for(let i=0;i<points.length;i++){const t=point(points[i]);el.dispatchEvent(new TouchEvent(i===0?'touchstart':'touchmove',{bubbles:true,cancelable:true,touches:[t],changedTouches:[t]}));await new Promise(r=>setTimeout(r,20));}
  const t=point(points.at(-1));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],changedTouches:[t]}));await new Promise(r=>setTimeout(r,450));}});
await page.waitForFunction(()=>touchDone);assert.equal(await page.evaluate(()=>touchQuiz.results[0].mistakes),0);
const N=await page.evaluate(()=>SENT.length);
for(let i=0;i<N;i++){
 await page.evaluate(i=>sentences(i),i);await page.waitForSelector('.tian svg');await noOverflow('sentence '+(i+1));await page.waitForTimeout(100);
 for(let j=0;j<60;j++){await page.evaluate(()=>{for(const w of testWriters)if(w._quiz?._isActive)while(w._quiz._isActive)w._quiz.nextStroke();});await page.waitForTimeout(320);if(await page.locator('#fb').textContent().then(t=>t.includes('Characters done')))break;}
 await page.fill('#en','Practice translation');await page.click('#chk');await page.click('#y');
}
await page.evaluate(()=>wordlist());await noOverflow('word list');await page.setViewportSize({width:320,height:740});await noOverflow('word list 320');
for(const f of ['home()','structure()','step(4)','wordOrder()','slotBuilder()','buildQuiz()','buildLearn(19)','families()','translate()'])
{await page.evaluate(f);await noOverflow(f+' at 320');}
await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>mock());
for(let i=0;i<11;i++){
 if(i<5){await page.fill('#py',await page.evaluate(()=>MS.items[MS.i].w.p));await page.fill('#en',await page.evaluate(()=>MS.items[MS.i].w.e[0]));}
 else {await page.click('#gu');await page.fill('#en','Practice answer');}
 await noOverflow('mock '+i);await page.click('#next');
}
await page.waitForSelector('.score');assert.match(await page.locator('h2').textContent(),/Review/);await noOverflow('review');
await page.evaluate(()=>mockToggle(10));assert.equal(await page.evaluate(()=>MS.items[10].enOk),true);
await page.evaluate(()=>{mock();document.querySelector('#py').value='saved answer';MS.end=Date.now()-1;mockTick();});assert.match(await page.locator('.card').first().textContent(),/Time’s up/);assert.equal(await page.evaluate(()=>MS.items[0].pyAns),'saved answer');

// ---- Persistence and isolation from Lessons 4 and 5 ----
assert.ok(await page.evaluate(()=>localStorage.getItem('l6-practice-v1')));
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('l4-practice-v1')).sentinel.n),9);
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('l5-practice-v1')).sentinel.n),7);
await page.reload();await page.waitForFunction(()=>!!window.HZ);assert.equal(await page.evaluate(()=>stepsDone()),33);assert.ok(await page.evaluate(()=>Object.keys(M).length>40));
await page.goto(base+'lesson-5/');assert.equal(await page.evaluate(()=>KEY),'l5-practice-v1');assert.equal(await page.evaluate(()=>M.sentinel.n),7);
await page.goto(base);assert.equal(await page.evaluate(()=>KEY),'l4-practice-v1');assert.equal(await page.evaluate(()=>M.sentinel.n),9);
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: local loads, exact word pool, stroke data, pinyin variants, all 33 structure steps, word-order acceptance + slot hints, slot builder, word building, translation, five-copy learning, recognition, hints/skip, touch drawing, all sentence drills, mock completion/timer/review, persistence, lesson isolation, 390/320px overflow, no console errors.');
})().catch(e=>{console.error(e);process.exit(1)});
