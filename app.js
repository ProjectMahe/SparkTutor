
// SparkTutor Extended - client-only
// New features: profile, settings (dark/dyslexia), teacher custom lessons, read-aloud, export CSV, shareable encoded lessons.

const QUESTIONS = [
  {q:"What is 2+2?", opts:["3","4","5","6"], a:1},
  {q:"Which is a frontend framework?", opts:["Django","Express","React","Flask"], a:2},
  {q:"Binary of 5 is?", opts:["101","111","100","110"], a:0},
  {q:"What does HTML stand for?", opts:["Hyper Trainer Marking Language","HyperText Markup Language","HotText Markup Language","None"], a:1},
  {q:"CSS is used for?", opts:["Structure","Styling","Database","Server"], a:1},
  {q:"Which is a NoSQL DB?", opts:["Postgres","MySQL","MongoDB","SQLite"], a:2},
  {q:"Time complexity of binary search?", opts:["O(n)","O(log n)","O(n log n)","O(1)"], a:1},
  {q:"Which HTTP status means 'Not Found'?", opts:["200","500","404","302"], a:2},
  {q:"JS method to parse JSON?", opts:["JSON.parse","JSON.stringify","parseJSON","toJSON"], a:0},
  {q:"Which tag inserts JS?", opts:["<script>","<js>","<link>","<code>"], a:0}
];

// Merge default lessons with any saved custom lessons
const DEFAULT_LESSONS = {
  "basics": {
    title: "Web & CS Basics — Starter Pack",
    content: "<h3>Quick Concepts</h3><ul><li>HTML structures content</li><li>CSS styles content</li><li>JS makes pages interactive</li></ul><p>Try a mini quiz to test recall.</p>"
  },
  "algos": {
    title: "Algorithms — Searching & Complexity",
    content: "<h3>Binary Search</h3><p>Binary search works on sorted arrays and runs in O(log n). Split the search interval in half each step.</p>"
  }
};

let LESSONS = Object.assign({}, DEFAULT_LESSONS);

let state = {answers: Array(10).fill(null), pos:0, recommended: null};

const el = id => document.getElementById(id);

function applySettings(){
  const s = JSON.parse(localStorage.getItem('sparktutor_settings')||'{}');
  if(s.dark) document.body.classList.add('dark'); else document.body.classList.remove('dark');
  if(s.dyslexia) document.body.classList.add('dyslexia'); else document.body.classList.remove('dyslexia');
}

function loadCustomLessons(){
  const custom = JSON.parse(localStorage.getItem('sparktutor_lessons')||'{}');
  LESSONS = Object.assign({}, DEFAULT_LESSONS, custom);
}

function show(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
  el(id).classList.remove('hidden');
}

function startDiagnostic(){ state = {answers: Array(10).fill(null), pos:0, recommended:null}; renderQuestion(); show('quiz'); }

function renderQuestion(){
  const i = state.pos;
  el('qnum').textContent = i+1;
  const Q = QUESTIONS[i];
  el('questionBox').innerHTML = "<p class='qtxt'>"+Q.q+"</p>";
  const choices = el('choices'); choices.innerHTML = "";
  Q.opts.forEach((o,idx)=>{
    const d = document.createElement('div'); d.className='choice'; d.textContent = o;
    if(state.answers[i]===idx) d.classList.add('selected');
    d.onclick = ()=>{ state.answers[i]=idx; renderQuestion(); }
    choices.appendChild(d);
  });
  el('prevBtn').disabled = i===0;
  el('nextBtn').textContent = i===QUESTIONS.length-1 ? 'Finish' : 'Next';
}

function next(){
  if(state.pos < QUESTIONS.length-1){ state.pos++; renderQuestion(); return; }
  const wrong = state.answers.map((a,i)=> a===QUESTIONS[i].a ? 0 : 1).reduce((s,v)=>s+v,0);
  const score = (QUESTIONS.length - wrong) +"/"+QUESTIONS.length;
  const rec = wrong>=4 ? 'basics' : 'algos';
  state.recommended = rec;
  saveProgress({score, recommended:rec, date: new Date().toISOString(), user: getProfileName()});
  el('recText').innerHTML = `<p>Your diagnostic score: <strong>${score}</strong></p><p>We recommend: <strong>${LESSONS[rec].title}</strong></p>`;
  show('recommend');
  // create share link
  const url = new URL(location.href);
  url.searchParams.set('lesson', rec);
  el('shareArea').innerHTML = `<a id="shareLink" href="${url.toString()}" target="_blank" rel="noreferrer">${url.toString()}</a>`;
}

function prev(){ if(state.pos>0) state.pos--; renderQuestion(); }

function openLesson(){
  const id = state.recommended || 'basics';
  renderLesson(id);
  show('lesson');
  const url = new URL(location.href);
  url.searchParams.set('lesson', id);
  el('shareArea').innerHTML = `<a id="shareLink" href="${url.toString()}" target="_blank" rel="noreferrer">${url.toString()}</a>`;
}

function renderLesson(id){
  loadCustomLessons();
  // support encoded custom lesson: lesson=custom:<base64>
  if(id && id.startsWith && id.startsWith('custom:')){
    try{
      const raw = atob(id.split(':')[1]);
      const obj = JSON.parse(raw);
      el('lessonTitle').textContent = obj.title || 'Custom Lesson';
      el('lessonContent').innerHTML = obj.content || '<p>No content</p>';
      return;
    }catch(e){ console.warn('invalid custom lesson'); }
  }
  const lesson = LESSONS[id] || {title:'Not found', content:'<p>Lesson not found</p>'};
  el('lessonTitle').textContent = lesson.title;
  el('lessonContent').innerHTML = lesson.content;
}

function explainWrong(){
  const expl = `<h4>Step-by-step explanation</h4><p>When you get an answer wrong, try: (1) Re-read the question; (2) Identify keywords; (3) Break into steps. Example: Binary of 5 → divide by 2, remainders 1,0,1 → 101.</p>`;
  el('lessonContent').insertAdjacentHTML('beforeend', expl);
}

function startMiniQuiz(){
  const q = {q:"Binary of 7?", opts:["110","111","101","100"], a:1};
  el('miniQuestion').innerHTML = "<p>"+q.q+"</p>";
  const mc = el('miniChoices'); mc.innerHTML="";
  q.opts.forEach((o,i)=>{
    const d = document.createElement('div'); d.className='choice'; d.textContent = o;
    d.onclick = ()=>{ mc.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected')); d.classList.add('selected'); mc.dataset.sel=i; }
    mc.appendChild(d);
  });
  el('miniNext').onclick = ()=> {
    const sel = parseInt(mc.dataset.sel||"-1");
    if(sel===q.a){ alert('Correct!'); saveProgress({miniPassed:true, date:new Date().toISOString(), user: getProfileName()}); show('dashboard'); updateDashboard(); }
    else { alert('Try again — view explanation.'); explainWrong(); }
  };
  show('miniquiz');
}

function updateDashboard(){
  const data = JSON.parse(localStorage.getItem('sparktutor_progress')||'[]');
  if(data.length===0) el('progressArea').innerHTML = "<p>No progress yet. Take the diagnostic!</p>";
  else {
    el('progressArea').innerHTML = "<ul>"+data.map(d=>`<li>${d.date.split('T')[0]} — Score: ${d.score||'N/A'} — Rec:${d.recommended||'N/A'} — User:${d.user||'Guest'}</li>`).join('')+"</ul>";
  }
}

function saveProgress(obj){
  const arr = JSON.parse(localStorage.getItem('sparktutor_progress')||'[]');
  arr.unshift(obj);
  localStorage.setItem('sparktutor_progress', JSON.stringify(arr.slice(0,200)));
}

function exportProgressCSV(){
  const data = JSON.parse(localStorage.getItem('sparktutor_progress')||'[]');
  if(data.length===0){ alert('No progress to export'); return; }
  const keys = Object.keys(data[0]);
  const rows = [keys.join(',')].concat(data.map(r=>keys.map(k=>`"${(r[k]||'').toString().replace(/"/g,'""')}"`).join(',')));
  const blob = new Blob([rows.join('\n')], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='sparktutor_progress.csv'; a.click(); URL.revokeObjectURL(url);
}

function saveProfile(){
  const name = el('profileName').value.trim();
  const email = el('profileEmail').value.trim();
  const p = {name, email};
  localStorage.setItem('sparktutor_profile', JSON.stringify(p));
  alert('Profile saved');
  show('home');
}

function loadProfile(){
  const p = JSON.parse(localStorage.getItem('sparktutor_profile')||'{}');
  el('profileName').value = p.name||'';
  el('profileEmail').value = p.email||'';
}

function getProfileName(){ const p = JSON.parse(localStorage.getItem('sparktutor_profile')||'{}'); return p.name||'Guest'; }

function saveSettings(){
  const s = {dark: el('darkToggle').checked, dyslexia: el('dyslexiaToggle').checked};
  localStorage.setItem('sparktutor_settings', JSON.stringify(s));
  applySettings();
  alert('Settings saved');
  show('home');
}

function loadSettings(){
  const s = JSON.parse(localStorage.getItem('sparktutor_settings')||'{}');
  el('darkToggle').checked = !!s.dark;
  el('dyslexiaToggle').checked = !!s.dyslexia;
}

function saveLesson(){
  const id = el('lessonId').value.trim();
  const title = el('lessonTitleInput').value.trim();
  const content = el('lessonContentInput').value.trim();
  if(!id || !title){ alert('Provide an id and title'); return; }
  const custom = JSON.parse(localStorage.getItem('sparktutor_lessons')||'{}');
  custom[id] = {title, content};
  localStorage.setItem('sparktutor_lessons', JSON.stringify(custom));
  alert('Lesson saved');
  el('lessonId').value=''; el('lessonTitleInput').value=''; el('lessonContentInput').value='';
  populateSavedList();
  loadCustomLessons();
}

function populateSavedList(){
  const custom = JSON.parse(localStorage.getItem('sparktutor_lessons')||'{}');
  const div = el('savedList'); div.innerHTML = "<h4>Saved Lessons</h4>";
  const keys = Object.keys(custom);
  if(keys.length===0) { div.innerHTML += "<p>No saved lessons</p>"; return; }
  const ul = document.createElement('ul');
  keys.forEach(k=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${k}</strong> — ${custom[k].title} <button data-id="${k}" class="small loadLessonBtn">Open</button> <button data-id="${k}" class="small shareLessonBtn">Share</button>`;
    ul.appendChild(li);
  });
  div.appendChild(ul);
  // attach handlers
  document.querySelectorAll('.loadLessonBtn').forEach(b=>{
    b.onclick = ()=>{ renderLesson(b.dataset.id); show('lesson'); el('shareArea').innerHTML = `<a id="shareLink" href="${location.href.split('?')[0]}?lesson=${b.dataset.id}">${location.href.split('?')[0]}?lesson=${b.dataset.id}</a>`; }
  });
  document.querySelectorAll('.shareLessonBtn').forEach(b=>{
    b.onclick = ()=>{
      const custom = JSON.parse(localStorage.getItem('sparktutor_lessons')||'{}');
      const obj = custom[b.dataset.id];
      if(!obj) return;
      const encoded = btoa(JSON.stringify(obj));
      const url = `${location.href.split('?')[0]}?lesson=custom:${encoded}`;
      navigator.clipboard.writeText(url).then(()=>alert('Share link copied to clipboard'));
    }
  });
}

function copyShareLink(){
  const link = document.getElementById('shareLink');
  if(!link){ alert('No link available'); return; }
  navigator.clipboard.writeText(link.href).then(()=>alert('Link copied to clipboard'));
}

function readAloud(){
  const text = el('lessonContent').innerText || el('lessonContent').textContent;
  if(!window.speechSynthesis){ alert('Read aloud not supported'); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(u);
}

function clearProgress(){
  if(confirm('Clear all saved progress?')){ localStorage.removeItem('sparktutor_progress'); updateDashboard(); }
}

function initFromUrl(){
  const params = new URLSearchParams(location.search);
  const lesson = params.get('lesson');
  if(lesson){
    renderLesson(lesson);
    show('lesson');
  }
}

// wire up events
document.getElementById('startBtn').onclick = startDiagnostic;
document.getElementById('guestBtn').onclick = ()=>{ alert('Continuing as guest'); }
document.getElementById('nextBtn').onclick = next;
document.getElementById('prevBtn').onclick = prev;
document.getElementById('openLessonBtn').onclick = openLesson;
document.getElementById('retakeBtn').onclick = startDiagnostic;
document.getElementById('explainBtn').onclick = explainWrong;
document.getElementById('quizMeBtn').onclick = startMiniQuiz;
document.getElementById('homeBtn').onclick = ()=>{ show('home'); }
document.getElementById('miniNext').onclick = ()=>{};
document.getElementById('profileBtn').onclick = ()=>{ loadProfile(); show('profile'); }
document.getElementById('saveProfile').onclick = saveProfile;
document.getElementById('closeProfile').onclick = ()=>show('home');
document.getElementById('settingsBtn').onclick = ()=>{ loadSettings(); show('settings'); }
document.getElementById('saveSettings').onclick = saveSettings;
document.getElementById('closeSettings').onclick = ()=>show('home');
document.getElementById('teacherBtn').onclick = ()=>{ populateSavedList(); show('teacher'); }
document.getElementById('saveLesson').onclick = saveLesson;
document.getElementById('closeTeacher').onclick = ()=>show('home');
document.getElementById('loadLessons').onclick = populateSavedList;
document.getElementById('exportBtn').onclick = exportProgressCSV;
document.getElementById('copyLinkBtn').onclick = copyShareLink;
document.getElementById('readAloudBtn').onclick = readAloud;
document.getElementById('clearProg').onclick = clearProgress;

window.onload = ()=>{ loadCustomLessons(); applySettings(); updateDashboard(); initFromUrl(); show('home'); }
