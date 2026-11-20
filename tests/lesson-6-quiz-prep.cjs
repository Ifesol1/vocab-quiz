// Run with PLAYWRIGHT_MODULE pointing at an installed Playwright package.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const base=process.env.TEST_BASE_URL||'http://localhost:8766/';
await page.goto(base);await page.evaluate(()=>{localStorage.setItem('l4-practice-v1',JSON.stringify({sentinel:{n:9}}));localStorage.setItem('l5-practice-v1',JSON.stringify({sentinel:{n:7}}));localStorage.setItem('l6-practice-v1',JSON.stringify({sentinel:{n:5}}));});

// ---- Every lesson's nav links to the quiz prep page the same way it links to the lessons ----
assert.equal(await page.locator('nav a[href="lesson-6/quiz-prep.html"]').count(),1);
await page.goto(base+'lesson-5/');assert.equal(await page.locator('nav a[href="../lesson-6/quiz-prep.html"]').count(),1);
await page.goto(base+'lesson-6/');assert.equal(await page.locator('nav a[href="quiz-prep.html"]').count(),1);assert.equal(await page.locator('aside').count(),0);
await page.goto(base+'lesson-6/quiz-prep.html');
assert.equal(await page.title(),'Lesson 6 Vocab Quiz · Nov 20 Quiz Prep');
assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('nav a')].map(a=>[a.getAttribute('href'),a.getAttribute('aria-current')])),[['../',null],['../lesson-5/',null],['./',null],['quiz-prep.html','page']]);
await page.waitForFunction(()=>typeof HanziWriter!=='undefined'&&!!window.HZ);
const noOverflow=async(label)=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow: '+label);
await noOverflow('home');

// ---- Exact pools from the Nov 20 study notes ----
assert.deepEqual(await page.evaluate(()=>[WRITE.length,ALL.length,SENT.length,KEY]),[17,50,3,'l6-quizprep-v1']);
assert.deepEqual(await page.evaluate(()=>WRITE.map(w=>[w.h,w.p,w.d])),[
 ['打电话','dǎ diànhuà','make a phone call'],['上午','shàngwǔ','morning'],['时间','shíjiān','time'],['问题','wèntí','question or problem'],
 ['要','yào','want to; be going to'],['开会','kāi huì','attend or hold a meeting'],['两节课','liǎng jié kè','two class periods'],['年级','niánjí','grade level'],
 ['考试','kǎoshì','an exam; take or give a test'],['以后','yǐhòu','afterward; after'],['空儿','kòngr','spare time'],['方便','fāngbiàn','convenient'],
 ['客气','kèqi','courteous; formal'],['帮','bāng','help'],['练习','liànxí','practice'],['说','shuō','say or speak'],['回来','huílái','come back']]);
assert.deepEqual(await page.evaluate(()=>SENT.map(s=>[s.h,s.p,s.e])),[
 ['您星期五上午有空儿吗？','Nín xīngqīwǔ shàngwǔ yǒu kòngr ma?','Are you free Friday morning?'],
 ['我下午有两节课，上午要开会。','Wǒ xiàwǔ yǒu liǎng jié kè, shàngwǔ yào kāi huì.','I have two classes in the afternoon and a meeting in the morning.'],
 ['我考试以后要练习说中文。','Wǒ kǎoshì yǐhòu yào liànxí shuō Zhōngwén.','After my exam, I\'m going to practice speaking Chinese.']]);
// Recognition: all 49 Lesson 6 vocabulary entries (Dialogues 1–2) plus the writing phrase 两节课.
assert.deepEqual(await page.evaluate(()=>ALL.map(w=>w.h).sort()),['打电话','上午','时间','问题','要','开会','两节课','年级','考试','以后','空儿','方便','客气','帮','练习','说','回来',
 '给','电话','喂','在','就','您','哪','位','下午','开','会','节','课','考','试','要是','到','办公室','行','等','别','常老师','下个','下','中文','文','准备','啊','但是','得','跟','见面','面'].sort());
assert.equal(await page.evaluate(()=>new Set(ALL.map(w=>w.h)).size),50);
assert.deepEqual(await page.evaluate(()=>[...WRITE.map(w=>w.h).join(''),...SENT.map(s=>s.h).join('')].filter(c=>!isPunct(c)&&!HZ[c])),[]);
assert.equal(await page.evaluate(()=>ALL.every(w=>gradePy(w.p,w).score===1)),true);
assert.deepEqual(await page.evaluate(()=>ALL.filter(w=>!enOK(w.d,w.e)).map(w=>w.h)),[]);
assert.equal(await page.evaluate(()=>{
 const cases=[['da3dian4hua4','打电话'],['kai1hui4','开会'],['liang3jie2ke4','两节课'],['kao3shi4','考试'],['kong4r','空儿'],['kong4','空儿'],['kong4 er5','空儿'],['ke4qi5','客气'],['ke4qi4','客气'],['hui2lai2','回来'],['hui2lai5','回来'],['wei2','喂'],['wei4','喂'],['na3','哪'],['nei3','哪'],['yao4shi5','要是'],['xia4ge5','下个'],['ban4gong1shi4','办公室']];
 return cases.every(([p,h])=>gradePy(p,ALL.find(w=>w.h===h)).score===1)&&gradePy('kao1shi4',WRITE.find(w=>w.h==='考试')).score===0.5&&gradePy('wrong',WRITE[0]).score===0;
}),true);
// Every recognition word has one sample sentence that contains it, with toned pinyin and English.
assert.equal(await page.evaluate(()=>Object.keys(EX).length),50);
assert.deepEqual(await page.evaluate(()=>ALL.filter(w=>!(w.x&&w.x.z.includes(w.h)&&/[。？！]$/.test(w.x.z)&&/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(w.x.p)&&/[.?!]$/.test(w.x.p)&&/[.?!”]$/.test(w.x.e)&&w.x.e.trim().length>3)).map(w=>w.h)),[]);
assert.equal(await page.evaluate(()=>['afterward','grade level','spare time','attend a meeting','be going to','give a test','courteous','say or speak'].every((a,i)=>enOK(a,WRITE.find(w=>w.h===['以后','年级','空儿','开会','要','考试','客气','说'][i]).e))),true);

// ---- Learn strokes, recognition, writing, touch drawing ----
await page.evaluate(()=>{window.testWriters=[];const original=makeWriter;makeWriter=function(...a){const w=original(...a);testWriters.push(w);return w;};});
await page.evaluate(()=>learn(WRITE.find(w=>w.h==='两节课')));await page.waitForSelector('.tian svg');await page.click('#replay');await page.click('#go');
for(let n=1;n<=5;n++){
 await page.waitForFunction(n=>document.querySelector('.pill')?.textContent.includes(`Copy ${n} of 5`),n);
 await page.waitForTimeout(150);
 for(let j=0;j<4;j++){await page.evaluate(()=>{for(const w of testWriters.slice(-3))while(w._quiz?._isActive)w.skipQuizStroke();});await page.waitForTimeout(350);}
}
await page.waitForSelector('#again');assert.match(await page.locator('h2').textContent(),/Locked in/);
// Recognition: the Chinese sentence (target highlighted) shows before answering; its pinyin and English only after.
for(const mode of ['right','wrong','idk']){
 await page.evaluate(()=>recog());
 const x=await page.evaluate(()=>({h:lastR.h,z:lastR.x.z,p:lastR.x.p,e:lastR.x.e,wp:lastR.p,we:lastR.e[0]}));
 assert.equal(await page.locator('#ex b').textContent(),x.h);assert.equal(await page.locator('#ex .hz').textContent(),x.z);
 const before=await page.locator('#app').textContent();assert.ok(!before.includes(x.p)&&!before.includes(x.e),'sentence pinyin/English hidden before answering');
 assert.equal(await page.locator('#exr').textContent(),'');await noOverflow('recognition before '+mode);
 if(mode==='idk')await page.click('#idk');else{await page.fill('#py',mode==='right'?x.wp:'wrong');await page.fill('#en',mode==='right'?x.we:'nope');await page.click('#chk');}
 assert.match(await page.locator('#fb').textContent(),mode==='right'?/✓ Pinyin/:/✗ Pinyin/);
 const after=await page.locator('#exr').textContent();assert.ok(after.includes(x.p)&&after.includes(x.e),'sentence revealed after '+mode);
 await noOverflow('recognition after '+mode);
}
await page.evaluate(()=>writing());assert.ok(await page.evaluate(()=>WRITE.includes(lastW)));await page.click('#hint');await page.click('#show');await page.waitForTimeout(200);await page.click('#skip');
await page.waitForTimeout(200);
// Draw 五 (only in the quiz prep stroke data) with real touch events along its bundled medians.
await page.evaluate(()=>{live.forEach(q=>q.cancel());window.touchDone=false;window.touchQuiz=quizSeq(document.querySelector('#q'),['五'],{onDone:()=>window.touchDone=true});});
await page.waitForTimeout(200);
await page.evaluate(async()=>{const el=document.querySelector('.tian.active svg');const b=el.getBoundingClientRect();const size=b.width,pad=Math.round(size*.06),scale=(size-2*pad)/1024;
 for(const points of HZ['五'].medians){const point=([x,y])=>new Touch({identifier:7,target:el,clientX:b.x+pad+x*scale,clientY:b.y+pad+(900-y)*scale});
  for(let i=0;i<points.length;i++){const t=point(points[i]);el.dispatchEvent(new TouchEvent(i===0?'touchstart':'touchmove',{bubbles:true,cancelable:true,touches:[t],changedTouches:[t]}));await new Promise(r=>setTimeout(r,20));}
  const t=point(points.at(-1));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],changedTouches:[t]}));await new Promise(r=>setTimeout(r,450));}});
await page.waitForFunction(()=>touchDone);assert.equal(await page.evaluate(()=>touchQuiz.results[0].mistakes),0);

// ---- All three sentence drills ----
for(let i=0;i<3;i++){
 await page.evaluate(i=>sentences(i),i);await page.waitForSelector('.tian svg');await noOverflow('sentence '+(i+1));await page.waitForTimeout(100);
 for(let j=0;j<60;j++){await page.evaluate(()=>{for(const w of testWriters)if(w._quiz?._isActive)while(w._quiz._isActive)w._quiz.nextStroke();});await page.waitForTimeout(320);if(await page.locator('#fb').textContent().then(t=>t.includes('Characters done')))break;}
 await page.fill('#en','Practice translation');await page.click('#chk');await page.click('#y');
}
await page.evaluate(()=>sentences());await page.click('#peek');assert.match(await page.locator('#pk').textContent(),/您星期五上午有空儿吗/);
await page.evaluate(()=>wordlist());await noOverflow('word list');assert.equal(await page.locator('table tr').count(),101);
assert.equal(await page.locator('td.exc b').count(),50);
assert.deepEqual(await page.evaluate(()=>{const t=document.querySelector('#app').textContent;return ALL.filter(w=>!(t.includes(w.x.z)&&t.includes(w.x.p)&&t.includes(w.x.e))).map(w=>w.h);}),[]);
await page.setViewportSize({width:320,height:740});for(const f of ['home()','wordlist()','recog()','learn()','sentences(1)']){await page.evaluate(f);await noOverflow(f+' at 320');}
await page.evaluate(()=>recog());await page.click('#idk');await noOverflow('recognition revealed at 320');
assert.ok(await page.evaluate(()=>{const b=document.querySelector('#ex').getBoundingClientRect();return b.left>=0&&b.right<=innerWidth;}));
await page.evaluate(()=>wordlist());assert.ok(await page.evaluate(()=>[...document.querySelectorAll('td.exc .exs')].every(e=>e.getBoundingClientRect().right<=innerWidth)),'word-list sentences fit at 320 without scrolling');
await page.setViewportSize({width:390,height:844});

// ---- Mock quiz: exactly 5 recognition + 5 writing (from the 17) + 1 sentence, 10 minutes, 12 points ----
await page.evaluate(()=>mock());
const shape=await page.evaluate(()=>({types:MS.items.map(it=>it.type).join(','),writeOK:MS.items.filter(it=>it.type==='write').every(it=>WRITE.includes(it.w)),
 recogOK:MS.items.filter(it=>it.type==='recog').every(it=>ALL.includes(it.w)),dupes:new Set(MS.items.filter(it=>it.w).map(it=>it.w.h)).size,left:MS.end-Date.now(),timer:document.querySelector('#timer').textContent}));
assert.equal(shape.types,'recog,recog,recog,recog,recog,write,write,write,write,write,sent');assert.equal(shape.writeOK,true);assert.equal(shape.recogOK,true);assert.equal(shape.dupes,10);
assert.ok(shape.left>595000&&shape.left<=600000);assert.match(shape.timer,/^(10:00|9:5\d)$/);
for(let i=0;i<11;i++){
 if(i<5){await page.fill('#py',await page.evaluate(()=>MS.items[MS.i].w.p));await page.fill('#en',await page.evaluate(()=>MS.items[MS.i].w.e[0]));}
 else {await page.click('#gu');await page.fill('#en','Practice answer');}
 assert.equal(await page.locator('#app .ex, #app .exs').count(),0,'no sample sentences during the mock');
 assert.equal(await page.evaluate(()=>{const it=MS.items[MS.i],t=document.querySelector('#app').textContent;return !!it.w&&(t.includes(it.w.x.z)||t.includes(it.w.x.p)||t.includes(it.w.x.e));}),false);
 await noOverflow('mock '+i);await page.click('#next');
}
await page.waitForSelector('.score');assert.match(await page.locator('h2').textContent(),/Review/);await noOverflow('review');
assert.equal(await page.locator('#app .exs').count(),10);
assert.deepEqual(await page.evaluate(()=>{const t=document.querySelector('#app').textContent;return MS.items.filter(it=>it.w&&!(t.includes(it.w.x.z)&&t.includes(it.w.x.p)&&t.includes(it.w.x.e))).map(it=>it.w.h);}),[]);
assert.equal(await page.evaluate(()=>MS.items.reduce((a,it)=>a+it.max,0)),12);assert.match(await page.locator('.score').textContent(),/\/ 12/);
await page.evaluate(()=>mockToggle(10));assert.equal(await page.evaluate(()=>MS.items[10].enOk),true);
await page.evaluate(()=>{mock();document.querySelector('#py').value='saved answer';MS.end=Date.now()-1;mockTick();});assert.match(await page.locator('.card').first().textContent(),/Time’s up/);assert.equal(await page.evaluate(()=>MS.items[0].pyAns),'saved answer');

// ---- Persistence and isolation from Lessons 4, 5 and the main Lesson 6 page ----
assert.ok(await page.evaluate(()=>localStorage.getItem('l6-quizprep-v1')));
await page.reload();await page.waitForFunction(()=>!!window.HZ);assert.ok(await page.evaluate(()=>Object.keys(M).length>0));
assert.deepEqual(await page.evaluate(()=>['l4-practice-v1','l5-practice-v1','l6-practice-v1'].map(k=>JSON.parse(localStorage.getItem(k)).sentinel.n)),[9,7,5]);
await page.goto(base+'lesson-6/');assert.equal(await page.evaluate(()=>KEY),'l6-practice-v1');assert.equal(await page.evaluate(()=>M.sentinel.n),5);
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: nav links from every lesson, exact 17 writing words / 50 recognition entries / 3 sentences from the study notes, stroke data, pinyin and English variants, a sample sentence per word (hidden pinyin/English until answered, shown in the word list and mock review only), five-copy learning, recognition, writing, touch drawing, sentence drills, 5+5+1 mock with 10-minute timer and 12 points, persistence, lesson isolation, 390/320px overflow, no console errors.');
})().catch(e=>{console.error(e);process.exit(1)});
