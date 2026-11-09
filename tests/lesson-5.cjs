// Run with PLAYWRIGHT_MODULE pointing at an installed Playwright package.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const base=process.env.TEST_BASE_URL||'http://localhost:8766/';
await page.goto(base);await page.evaluate(()=>localStorage.setItem('l4-practice-v1',JSON.stringify({sentinel:{n:9}})));
await page.goto(base+'lesson-5/');
assert.equal(await page.title(),'Lesson 5 Vocab Quiz · Practice');
await page.waitForFunction(()=>typeof HanziWriter!=='undefined'&&!!window.HZ);
assert.deepEqual(await page.evaluate(()=>[WRITE.length,ALL.length,SENT.length]),[18,37,3]);
assert.equal(await page.evaluate(()=>WRITE.map(w=>w.h).join('，')),'进来，介绍，一下，高兴，漂亮，坐，在，哪儿，喝，茶，要，给，瓶，杯，可以，一起，才，回家');
assert.deepEqual(await page.evaluate(()=>SENT.map(s=>s.h)),['你们家很大，也很漂亮。','我不喜欢喝茶，可以给我一杯水吗？','他们一起聊天儿、看电视，晚上十二点才回家。']);
assert.equal(await page.evaluate(()=>[...WRITE.map(w=>w.h).join(''),...SENT.map(s=>s.h).join('')].filter(c=>!isPunct(c)&&!HZ[c]).length),0);
assert.equal(await page.evaluate(()=>ALL.every(w=>gradePy(w.p,w).score===1)),true);
assert.equal(await page.evaluate(()=>{
 const cases=[['jin4lai2','进来'],['jin4lai5','进来'],['yi1xia4','一下'],['yi2xia4','一下'],['yi1qi3','一起'],['yi4qi3','一起'],['na3','哪儿'],['na3r','哪儿'],['na3 er5','哪儿'],['piao4liang0','漂亮'],['dui4bu5qi3','对不起'],['liao2 tian1','聊天儿'],['wan2r','玩儿'],['dian3 er0','点儿'],['ya5','呀'],['ba0','吧']];return cases.every(([p,h])=>gradePy(p,ALL.find(w=>w.h===h)).score===1)&&gradePy('jin1lai2',WRITE[0]).score===0.5&&gradePy('wrong',WRITE[0]).score===0;
}),true);
await page.evaluate(()=>{window.testWriters=[];const original=makeWriter;makeWriter=function(...a){const w=original(...a);testWriters.push(w);return w;};});
const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await noOverflow();
await page.evaluate(()=>learn(WRITE[0]));await page.waitForSelector('.tian svg');await page.click('#replay');await page.click('#go');
// Drive the real library quiz stroke progression; pointer input is checked separately below.
for(let n=1;n<=5;n++){
 await page.waitForFunction(n=>document.querySelector('.pill')?.textContent.includes(`Copy ${n} of 5`),n);
 await page.waitForTimeout(150);
 for(let j=0;j<3;j++){await page.evaluate(()=>{for(const w of testWriters.slice(-2))while(w._quiz?._isActive)w.skipQuizStroke();});await page.waitForTimeout(350);}
}
await page.waitForSelector('#again');assert.match(await page.locator('h2').textContent(),/Locked in/);
await page.evaluate(()=>recog());await page.fill('#py',await page.evaluate(()=>lastR.p));await page.fill('#en',await page.evaluate(()=>lastR.e[0]));await page.click('#chk');assert.match(await page.locator('#fb').textContent(),/✓ Pinyin/);
await page.evaluate(()=>writing());await page.click('#hint');await page.click('#show');await page.waitForTimeout(200);await page.click('#skip');
await page.waitForTimeout(200);
// Draw a real character via touch using its bundled median coordinates.
await page.evaluate(()=>{live.forEach(q=>q.cancel());window.touchDone=false;window.touchQuiz=quizSeq(document.querySelector('#q'),['一'],{onDone:()=>window.touchDone=true});});
await page.waitForTimeout(150);
await page.evaluate(async()=>{const el=document.querySelector('.tian.active svg');const b=el.getBoundingClientRect();const size=b.width,pad=Math.round(size*.06),scale=(size-2*pad)/1024;const points=HZ['一'].medians[0];const point=([x,y])=>new Touch({identifier:7,target:el,clientX:b.x+pad+x*scale,clientY:b.y+pad+(900-y)*scale});for(let i=0;i<points.length;i++){const t=point(points[i]);el.dispatchEvent(new TouchEvent(i===0?'touchstart':'touchmove',{bubbles:true,cancelable:true,touches:[t],changedTouches:[t]}));await new Promise(r=>setTimeout(r,20));}const t=point(points.at(-1));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],changedTouches:[t]}));});
await page.waitForFunction(()=>touchDone);assert.equal(await page.evaluate(()=>touchQuiz.results[0].mistakes),0);
for(let i=0;i<3;i++){
 await page.evaluate(i=>sentences(i),i);await page.waitForSelector('.tian svg');await noOverflow();await page.waitForTimeout(100);
 await page.evaluate(()=>{for(const w of testWriters.slice(-SENT[Number(document.querySelector('.pill').textContent.match(/\d/)[0])-1].h.replace(/[，。？！、,.?! ]/g,'').length)){while(w._quiz&&w._quiz._isActive)w._quiz.nextStroke();}});
 // Sequential quiz transitions are asynchronous; finish each active writer as it starts.
 for(let j=0;j<40;j++){await page.evaluate(()=>{for(const w of testWriters)if(w._quiz?._isActive)while(w._quiz._isActive)w._quiz.nextStroke();});await page.waitForTimeout(320);if(await page.locator('#fb').textContent().then(t=>t.includes('Characters done')))break;}
 await page.fill('#en','Practice translation');await page.click('#chk');await page.click('#y');
}
await page.evaluate(()=>wordlist());await noOverflow();await page.setViewportSize({width:320,height:740});await noOverflow();await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>mock());
for(let i=0;i<11;i++){
 if(i<5){await page.fill('#py',await page.evaluate(()=>MS.items[MS.i].w.p));await page.fill('#en',await page.evaluate(()=>MS.items[MS.i].w.e[0]));}
 else {await page.click('#gu');await page.fill('#en','Practice answer');}
 await noOverflow();await page.click('#next');
}
await page.waitForSelector('.score');assert.match(await page.locator('h2').textContent(),/Review/);await noOverflow();
await page.evaluate(()=>mockToggle(10));assert.equal(await page.evaluate(()=>MS.items[10].enOk),true);
await page.evaluate(()=>{mock();document.querySelector('#py').value='saved answer';MS.end=Date.now()-1;mockTick();});assert.match(await page.locator('.card').first().textContent(),/Time’s up/);assert.equal(await page.evaluate(()=>MS.items[0].pyAns),'saved answer');
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('l4-practice-v1')).sentinel.n),9);assert.ok(await page.evaluate(()=>localStorage.getItem('l5-practice-v1')));
await page.reload();assert.ok(await page.evaluate(()=>Object.keys(M).length));await page.goto(base);assert.equal(await page.evaluate(()=>KEY),'l4-practice-v1');assert.equal(await page.evaluate(()=>M.sentinel.n),9);
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: local loads, exact pools, pinyin variants, five-copy learning, recognition, hints/replay/skip, sentence drills, mock completion/timer/review, persistence, lesson isolation, mobile overflow.');
})().catch(e=>{console.error(e);process.exit(1)});
