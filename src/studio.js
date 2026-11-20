const menu=[['home','Главная'],['subjects','Предметы'],['audit','План сдачи']];
const EXTRA=['home','subjects','pe','audit','workspace','catalog','projects','docs','defense','settings'];
const pe = {id:'pe',short:'Физическая культура',title:'Физическая культура (ОФП/СМГ)',teacher:'Преподаватель уточняется',form:'Зачёт',status:'Требования уточняются',labs:[]};
const allSubjects = ()=>[...SUBJECTS,pe];
const entries = ()=>SUBJECTS.flatMap(s=>s.labs.map(([n,title,detail],i)=>({s,i,n,title,detail,route:'#/'+s.id+'/demo/'+i})));
const actionLink=(label,route,cls='btn secondary')=>'<a class="'+cls+'" href="'+esc(route)+'">'+esc(label)+'</a>';
const groupTitle=(title,aside='')=>'<div class="group-title"><h2>'+esc(title)+'</h2>'+aside+'</div>';
const routeFor=s=>s.id==='pe'?'#/pe':'#/'+s.id+'/labs/0';
const subjectInitials=['БД','ƒx','AI','SQL','ИС','JS','QA','ФК'];
function nav(){
 const active=['audit','settings'].includes(subject)?'audit':!subject||subject==='home'?'home':'subjects';
 $('#nav').innerHTML=menu.map(([id,name])=>'<a class="rail-link" '+(id===active?'aria-current="page"':'')+' href="#/'+id+'">'+name+'</a>').join('');
}
function logActivity(kind,label,route,file){
 const item={kind,label,route,file,time:new Date().toISOString()};
 const recent=readStore('activity',[]).filter(x=>!(x.route===route&&x.label===label));
 writeStore('activity',[item,...recent].slice(0,16));
}
function lastLab(){const r=readStore('activity',[]).find(x=>x.kind==='Лабораторная');return entries().find(e=>e.route===r?.route)||entries().find(e=>e.s.id==='std')}
function notify(message){const box=$('#toast');box.textContent=message;box.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>box.classList.remove('show'),3200)}
const planLabels=['Не начато','В работе','Готово','Сдано'];
function workKey(e){return stageKey(e.s,e.i)}
function mark(e){return Math.max(0,Math.min(3,STAGES.indexOf(progress()[workKey(e)])))}
function signed(e){
 const id=workKey(e),marks=readStore('teacherMarks',{});
 return marks[id]??(progress()[id]==='Принято');
}
function official(e){
 const id=e.s.id+'-lr'+e.n.replace('.','');
 return REGISTER.subjects.find(s=>s.id===e.s.id)?.works.some(w=>w.id===id&&w.assignment_state==='original_laboratory_file')||
 (e.s.id==='isit'&&e.n==='КР1');
}
function workTitle(e){return (/^\d/.test(e.n)?'ЛР '+e.n+' · ':'')+e.title}
function tag(e){return '<span class="work-status status-'+mark(e)+'">'+planLabels[mark(e)]+'</span>'}
function nextWork(){
 const items=entries().filter(official),recent=readStore('activity',[]).find(r=>r.kind==='Лабораторная');
 return entries().find(e=>e.route===recent?.route&&mark(e)<2)||items.find(e=>mark(e)===1)||items.find(e=>mark(e)===0)||items.find(e=>mark(e)===2);
}
function cards(){
 return '<div class="subject-grid">'+allSubjects().map((s,i)=>'<a class="subject-card" href="'+routeFor(s)+'" title="'+esc(s.title)+'"><span class="subject-icon tone-'+i+'">'+subjectInitials[i]+'</span><span><h3>'+esc(s.short)+'</h3><small>'+esc(s.form)+'</small></span><span aria-hidden="true">→</span></a>').join('')+'</div>';
}
function overview(){
 const works=entries().filter(official),next=nextWork(),done=works.filter(e=>mark(e)>=2),submitted=works.filter(e=>mark(e)===3);
 const pending=works.filter(e=>mark(e)<3&&e.route!==next?.route).sort((a,b)=>mark(b)-mark(a)).slice(0,2);
 return '<div class="page-heading"><small>ДГТУ · ВОЗПИ-31 · 3 курс</small><h1>Моя учёба</h1></div>'+
 '<div class="home-focus"><section class="continue-panel"><small>Следующая работа</small><h2>'+esc(next?workTitle(next):'Все известные работы сданы')+'</h2><p>'+esc(next?next.s.title:'Новые задания появятся после уточнения требований.')+'</p>'+actionLink(next?'Продолжить работу →':'Открыть план сдачи',next?.route||'#/audit','btn')+'</section>'+
 '<section class="plan-preview"><div class="group-title"><h2>План сдачи</h2>'+actionLink('Весь план →','#/audit','text-link')+'</div><p>Выполнено <b>'+done.length+' из '+works.length+'</b> · сдано '+submitted.length+'</p>'+pending.map(e=>'<a class="list-item" href="'+e.route+'"><span><small>'+esc(e.s.short)+'</small><b>'+esc(workTitle(e))+'</b></span>'+tag(e)+'</a>').join('')+'</section></div>'+groupTitle('Предметы')+cards();
}
function workRows(items,editable=false){
 return items.map(e=>{
  const key=esc(workKey(e)),title=esc(workTitle(e));
  const tools=editable?'<select aria-label="Статус: '+title+'" data-progress="'+key+'">'+planLabels.map((v,i)=>'<option value="'+i+'" '+(mark(e)===i?'selected':'')+'>'+v+'</option>').join('')+'</select><label class="teacher"><input type="checkbox" data-teacher="'+key+'" '+(signed(e)?'checked':'')+'> Отметка преподавателя</label>':tag(e);
  return '<div class="work-row"><a href="'+e.route+'">'+title+'</a>'+tools+(editable?'':actionLink('Открыть',e.route,'tool'))+'</div>';
 }).join('');
}
function subjectPage(s){
 const tasks=entries().filter(e=>e.s.id===s.id);
 return actionLink('← Предметы','#/subjects','text-link')+'<div class="page-heading"><h1>'+esc(s.title)+'</h1><p>'+esc(s.teacher)+' · '+esc(s.form)+'</p></div>'+
 (tasks.length?'<section class="panel"><h2>Работы и практика</h2>'+workRows(tasks)+'</section>':'<section class="panel"><p>Преподаватель и требования к зачёту уточняются.</p></section>')+
 '<details class="panel resources"><summary>Учебные материалы</summary><div class="actions">'+(s.id==='pe'?'<button class="tool" data-file="docs/08-physical-education.md">Справка по ОФП / СМГ</button>':actionLink('Файлы и исходники','#/'+s.id+'/code/0')+actionLink('Комплект для сдачи','#/'+s.id+'/deliver/0'))+
 (s.id==='std'?actionLink('Вариант № 3 и отчёт Word','./kanygin.html'):'')+(['db','isit','design'].includes(s.id)?actionLink('Реестр обращений','#/workspace'):'')+'</div></details>';
}
function submissionPlan(){
 const items=entries(),required=items.filter(official),extra=items.filter(e=>!official(e));
 function groups(rows){return SUBJECTS.map(s=>{const subset=rows.filter(e=>e.s.id===s.id);return subset.length?'<section class="plan-group"><h3>'+esc(s.short)+'</h3>'+workRows(subset,true)+'</section>':''}).join('')}
 const panel='<div class="page-heading"><small>ВОЗПИ-31 · 3 курс</small><h1>План сдачи</h1><p>Сдано '+required.filter(e=>mark(e)===3).length+' из '+required.length+' известных работ. Отметки хранятся в этом браузере.</p></div>';
 return panel+'<div class="panel">'+groups(required)+'</div><details class="panel resources"><summary>Практика и требования к уточнению</summary>'+groups(extra)+'<h3>Физическая культура</h3>'+actionLink('Уточнить требования к зачёту','#/pe','text-link')+'</details>'+
 '<details class="panel resources"><summary>Данные и настройки</summary>'+settings()+'<details><summary>Прежний чек-лист и аудит источников</summary><div id="legacyAudit"></div></details></details>';
}
function bindPlan(){
 const items=new Map(entries().map(e=>[workKey(e),e]));
 const update=()=>{const works=entries().filter(official);$('#main .page-heading p').textContent='Сдано '+works.filter(e=>mark(e)===3).length+' из '+works.length+' известных работ. Отметки хранятся в этом браузере.'};
 function save(key,v){if(!writeStore(key,v))notify('Данные доступны только до закрытия страницы')}
 $('#main').onchange=ev=>{
  const el=ev.target;
  if(el.dataset.teacher)save('teacherMarks',{...readStore('teacherMarks',{}),[el.dataset.teacher]:el.checked});
  if(el.dataset.progress){const k=el.dataset.progress,e=items.get(k);save('teacherMarks',{...readStore('teacherMarks',{}),[k]:signed(e)});save('progress',{...progress(),[k]:STAGES[+el.value]});update()}
 };
 const legacy=document.createElement('div');legacy.innerHTML=audit();
 for(const selector of ['.checklist','.doc']){const part=legacy.querySelector(selector);if(part)$('#legacyAudit').append(part)}
 $('#legacyAudit').querySelectorAll('[data-check]').forEach(el=>{const key='bf-check-'+el.dataset.check;try{el.checked=localStorage.getItem(key)==='1'}catch{}el.onchange=()=>{try{localStorage.setItem(key,el.checked?'1':'0')}catch{notify('Хранилище недоступно')}}});
 $('#exportAll').onclick=()=>download('BANKFLOW-state.json',JSON.stringify(backup(),null,2),'application/json');
 $('#importAll').onchange=async ev=>{
  try{const copy=JSON.parse(await ev.target.files[0].text());
   if(copy.version===1&&copy.progress&&typeof copy.progress==='object'&&!Array.isArray(copy.progress)){
    const vals=Object.entries(copy.progress);if(!vals.every(([k,v])=>items.has(k)&&STAGES.includes(v)))throw Error('Некорректный файл прогресса');save('progress',{...progress(),...copy.progress})
   }else restore(copy);
   applyTheme();render();notify('Данные импортированы')
  }catch(err){notify(err.message)}
 };
 $('#setTheme').onclick=()=>applyTheme(true);
}
function settings(){return '<div class="actions"><button class="tool" id="exportAll">Экспорт JSON</button><label class="tool">Импорт JSON <input type="file" id="importAll" accept=".json"></label><button class="tool" id="setTheme">Переключить тему</button></div>'}
function applyTheme(toggle=false){let dark=readStore('theme','light')==='dark';if(toggle){dark=!dark;writeStore('theme',dark?'dark':'light')}document.documentElement.dataset.theme=dark?'dark':'light'}
function backup(){
 const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(STORE)||/^bf-check-\d+$/.test(k))data[k]=localStorage.getItem(k)}
 return {application:'BANKFLOW',version:2,data};
}
function restore(copy){
 if(copy?.application!=='BANKFLOW'||copy.version!==2||!copy.data||Array.isArray(copy.data)||typeof copy.data!=='object')throw Error('Формат файла не поддерживается');
 const rows=Object.entries(copy.data),object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 for(const [key,raw] of rows){
  if(typeof raw!=='string')throw Error('Повреждена запись');
  if(/^bf-check-\d+$/.test(key)&&['0','1'].includes(raw))continue;
  if(!key.startsWith(STORE))throw Error('Неизвестный ключ');
  const k=key.slice(STORE.length),v=JSON.parse(raw);
  const safeRoute=r=>typeof r==='string'&&r.startsWith('#/');
  const valid={teacherMarks:()=>object(v)&&Object.values(v).every(x=>typeof x==="boolean"),planDurations:()=>Array.isArray(v)&&v.length===DATA.schedule.length&&v.every(x=>Number.isInteger(x)&&x>=1&&x<=365),theme:()=>['light','dark'].includes(v),collapsed:()=>typeof v==='boolean',progress:()=>object(v)&&Object.values(v).every(x=>STAGES.includes(x)),
   activity:()=>Array.isArray(v)&&v.every(x=>object(x)&&safeRoute(x.route)&&typeof x.label==='string'&&typeof x.kind==='string'),
   requests:()=>Array.isArray(v)&&v.every(x=>object(x)&&Number.isInteger(x.id)&&statuses.includes(x.status)&&['client_id','employee_id','product_id'].every(f=>Number.isInteger(x[f]))),
   experiments:()=>object(v)&&Object.values(v).every(x=>object(x)&&object(x.inputs)&&typeof x.result==='string'&&typeof x.note==='string'),
   specimens:()=>Array.isArray(v)&&v.every(x=>object(x)&&typeof x.name==='string'&&Number.isInteger(x.id))};
  if(!Object.hasOwn(valid,k)||!valid[k]())throw Error('Некорректная запись: '+k);
 }
 const before=rows.map(([k])=>[k,localStorage.getItem(k)]);try{for(const [k,v] of rows)localStorage.setItem(k,v)}catch(e){for(const [k,v] of before){if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}throw e}
}
function renderStudio(){
 const C=$('#main');C.onchange=null;
 document.body.classList.toggle('defending',subject==='defense');
 if(!subject||subject==='home')C.innerHTML=overview();
 else if(['subjects','catalog','docs'].includes(subject))C.innerHTML='<div class="page-heading"><h1>Предметы</h1></div>'+cards();
 else if(['settings','audit'].includes(subject)){C.innerHTML=submissionPlan();bindPlan()}
 else if(subject==='pe')C.innerHTML=subjectPage(pe);
 else if(subject==='defense')showDefense();
 else if(['projects','workspace'].includes(subject)){workspace();C.insertAdjacentHTML('afterbegin',actionLink('← Базы данных',routeFor(SUBJECTS[0]),'text-link'))}
 else return false;
 bindFiles();return true;
}
function initStudio(){
 applyTheme();
 const dialog=$('#finder'),input=$('#findText');
 function search(){const q=input.value.trim().toLocaleLowerCase('ru');const items=[...allSubjects().map(s=>[s.title,'Дисциплина',routeFor(s)]),...entries().map(e=>[e.title,e.s.short+' · '+e.n,e.route]),...Object.keys(FILES).map(k=>[FILES[k].name,k,null,k])].filter(x=>x.slice(0,2).join(' ').toLocaleLowerCase('ru').includes(q)).slice(0,40);
 $('#matches').innerHTML=items.map(([title,meta,href,file])=>href?'<a class="list-item" href="'+esc(href)+'"><span><b>'+esc(title)+'</b><small>'+esc(meta)+'</small></span></a>':'<button class="list-item" data-file="'+esc(file)+'"><span><b>'+esc(title)+'</b><small>'+esc(meta)+'</small></span></button>').join('')||'<p class="empty">Совпадений нет</p>';bindFiles()}
 $('#globalSearch').onclick=()=>{input.value='';search();dialog.showModal();input.focus()};input.oninput=search;$('#matches').onclick=()=>dialog.close();document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!dialog.open)$('#globalSearch').click()}});
}
