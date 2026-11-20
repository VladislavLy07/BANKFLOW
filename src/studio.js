const menu = [
 ['home','Обзор','▦'],['subjects','Дисциплины','▤'],['catalog','Лабораторные','⌬'],
 ['projects','Проекты','◇'],['docs','Документация','▧'],['defense','Режим защиты','▷'],['settings','Настройки','⚙']
];
const EXTRA = [...menu.map(item=>item[0]),'pe','audit','workspace'];
const pe = {id:'pe',short:'Физическая культура',title:'Физическая культура (ОФП/СМГ)',teacher:'Преподаватель уточняется',form:'Зачёт',status:'Требования уточняются',labs:[]};
const allSubjects = ()=>[...SUBJECTS,pe];
const entries = ()=>SUBJECTS.flatMap(s=>s.labs.map(([n,title,detail],i)=>({s,i,n,title,detail,route:'#/'+s.id+'/demo/'+i})));
const actionLink=(label,route,cls='btn secondary')=>'<a class="'+cls+'" href="'+esc(route)+'">'+esc(label)+'</a>';
const groupTitle=(title,aside='')=>'<div class="group-title"><h2>'+esc(title)+'</h2>'+aside+'</div>';
const routeFor=s=>s.id==='pe'?'#/pe':'#/'+s.id+'/labs/0';
const subjectInitials=['БД','ƒx','AI','SQL','ИС','JS','QA','ФК'];
function nav(){
 const active=SUBJECTS.some(s=>s.id===subject)||subject==='pe'?'subjects':subject==='workspace'?'projects':subject==='audit'?'catalog':subject||'home';
 $('#nav').innerHTML=menu.map(([id,name,icon])=>'<a class="rail-link" title="'+name+'" '+(id===active?'aria-current="page"':'')+' href="#/'+id+'"><span aria-hidden="true">'+icon+'</span><b>'+name+'</b></a>').join('');
 $('#breadcrumb').textContent='BANKFLOW / '+(menu.find(x=>x[0]===active)?.[1]||'Обзор');
}
function logActivity(kind,label,route,file){
 const item={kind,label,route,file,time:new Date().toISOString()};
 const recent=readStore('activity',[]).filter(x=>!(x.route===route&&x.label===label));
 writeStore('activity',[item,...recent].slice(0,16));
}
function lastLab(){const r=readStore('activity',[]).find(x=>x.kind==='Лабораторная');return entries().find(e=>e.route===r?.route)||entries().find(e=>e.s.id==='std')}
function notify(message){const box=$('#toast');box.textContent=message;box.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>box.classList.remove('show'),3200)}
function cards(){return '<div class="subject-grid">'+allSubjects().map((s,i)=>'<a class="subject-card" href="'+routeFor(s)+'"><span class="subject-icon tone-'+i+'">'+subjectInitials[i]+'</span><small>'+esc(s.form)+'</small><h3>'+esc(s.title)+'</h3><p>'+esc(s.teacher)+'</p><span class="card-status">'+esc(s.status)+'</span></a>').join('')+'</div>'}
function recent(){const rows=readStore('activity',[]);return rows.length?rows.slice(0,6).map(r=>'<a class="list-item" href="'+esc(r.file&&Object.hasOwn(FILES,r.file)?'./'+r.file:r.route)+'"><span><small>'+esc(r.kind)+'</small><b>'+esc(r.label)+'</b></span><small>'+esc(new Date(r.time).toLocaleDateString('ru-RU'))+'</small></a>').join(''):'<p class="empty">Здесь появятся открытые работы, сохранённые результаты и скачанные документы.</p>'}
function overview(){
 const known=REGISTER.subjects.flatMap(s=>s.works),marks=entries().map(e=>progress()[stageKey(e.s,e.i)]);
 const stats=[['Подтверждённые задания',known.filter(w=>w.assignment_state==='original_laboratory_file').length,'Есть оригинал задания'],
 ['Выполненные работы',marks.filter(v=>STAGES.indexOf(v)>=2).length,'По личному плану сдачи'],
 ['На проверке',marks.filter(v=>v==='Передано').length,'Отмечены как переданные'],
 ['Требуют уточнения',known.filter(w=>w.assignment_state!=='original_laboratory_file').length,'Позиции учебного реестра']];
 const next=lastLab();
 return '<div class="page-heading"><small>ДГТУ / Прикладная информатика</small><h1>Command Center</h1></div><section class="welcome"><div><small>ВОЗПИ-31 &nbsp; / &nbsp; 3 курс</small><h2>BANKFLOW — учебная информационная система</h2><p>09.03.03 «Прикладная информатика»</p><div class="actions">'+actionLink('Продолжить работу →',next.route,'btn')+actionLink('Перейти к защите','#/defense','light-link')+'</div></div><div class="workmap"><strong>Карта работ</strong>'+SUBJECTS.map(s=>'<div><small>'+esc(s.short)+'</small><span>'+s.labs.map((l,i)=>'<a href="#/'+s.id+'/demo/'+i+'" aria-label="'+esc(s.short+' · '+l[1])+'" title="'+esc(l[1])+'" class="'+(STAGES.indexOf(progress()[stageKey(s,i)])>=2?'done':'')+'"></a>').join('')+'</span></div>').join('')+'</div></section><div class="stats">'+stats.map(([label,count,note])=>'<div><small>'+label+'</small><strong>'+count+'</strong><span>'+note+'</span></div>').join('')+'</div>'+groupTitle('Дисциплины',actionLink('Открыть лабораторию →','#/catalog','text-link'))+cards()+groupTitle('Последняя активность','<button class="tool" data-file="modules/07-standards/variant-3.docx">Скачать отчёт</button>')+'<section class="panel">'+recent()+'</section>';
}
function labRows(items){return items.map(e=>'<a class="list-item" href="'+e.route+'"><span><small>'+esc(e.s.short)+' · '+esc(e.n)+'</small><b>'+esc(e.title)+'</b></span><span>→</span></a>').join('')}
function settings(){return '<section class="panel"><h2>Внешний вид</h2><button class="tool" id="setTheme">Переключить тему</button></section><section class="panel"><h2>Резервная копия</h2><p>Настройки, результаты, заметки, личный прогресс и демонстрационные записи этого браузера.</p><div class="actions"><button class="btn" id="exportAll">Экспорт JSON</button><label class="tool">Импорт JSON <input type="file" id="importAll" accept=".json"></label></div></section>'+actionLink('Открыть личный план сдачи','#/audit')}
function applyTheme(toggle=false){let dark=readStore('theme',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')==='dark';if(toggle){dark=!dark;writeStore('theme',dark?'dark':'light')}document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').setAttribute('aria-pressed',String(dark))}
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
  const valid={planDurations:()=>Array.isArray(v)&&v.length===DATA.schedule.length&&v.every(x=>Number.isInteger(x)&&x>=1&&x<=365),theme:()=>['light','dark'].includes(v),collapsed:()=>typeof v==='boolean',progress:()=>object(v)&&Object.values(v).every(x=>STAGES.includes(x)),
   activity:()=>Array.isArray(v)&&v.every(x=>object(x)&&safeRoute(x.route)&&typeof x.label==='string'&&typeof x.kind==='string'),
   requests:()=>Array.isArray(v)&&v.every(x=>object(x)&&Number.isInteger(x.id)&&statuses.includes(x.status)&&['client_id','employee_id','product_id'].every(f=>Number.isInteger(x[f]))),
   experiments:()=>object(v)&&Object.values(v).every(x=>object(x)&&object(x.inputs)&&typeof x.result==='string'&&typeof x.note==='string'),
   specimens:()=>Array.isArray(v)&&v.every(x=>object(x)&&typeof x.name==='string'&&Number.isInteger(x.id))};
  if(!Object.hasOwn(valid,k)||!valid[k]())throw Error('Некорректная запись: '+k);
 }
 const before=rows.map(([k])=>[k,localStorage.getItem(k)]);try{for(const [k,v] of rows)localStorage.setItem(k,v)}catch(e){for(const [k,v] of before){if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}throw e}
}
function renderStudio(){
 document.body.classList.toggle('defending',subject==='defense');
 if(subject&&(!EXTRA.includes(subject)||['audit','workspace'].includes(subject)))return false;
 const C=$('#main'),name=menu.find(x=>x[0]===subject)?.[1]||pe.short;
 const head='<div class="page-heading"><small>BANKFLOW / Command Center</small><h1>'+esc(name)+'</h1></div>';
 if(!subject||subject==='home')C.innerHTML=overview();
 else if(subject==='defense'){showDefense();return true}
 else if(subject==='subjects')C.innerHTML=head+cards();
 else if(subject==='pe')C.innerHTML=head+'<section class="panel"><h2>ОФП / СМГ · зачёт</h2><p>Преподаватель, нормативы и формат сдачи уточняются.</p><button class="tool" data-file="docs/08-physical-education.md">Скачать справку</button></section>';
 else if(subject==='catalog')C.innerHTML=head+actionLink('Личный план сдачи','#/audit')+'<section class="panel">'+labRows(entries())+'</section>';
 else if(subject==='projects')C.innerHTML=head+'<section class="panel"><h2>Система банковских обращений</h2><p>Клиенты, продукты, исполнители и статусы обращений.</p><div class="actions">'+actionLink('Открыть реестр','#/workspace','btn')+actionLink('Архитектура и сценарии','#/design/demo/1')+'</div></section>';
 else if(subject==='docs')C.innerHTML=head+'<section class="panel">'+Object.entries(FILES).filter(([k])=>/\.(docx|md|zip|ipynb)$/.test(k)).map(([k,f])=>'<button class="list-item" data-file="'+esc(k)+'"><span><small>'+esc(k.split('/').slice(0,-1).join('/'))+'</small><b>'+esc(f.name)+'</b></span>↓</button>').join('')+'</section>';
 else if(subject==='settings'){C.innerHTML=head+settings();$('#setTheme').onclick=()=>applyTheme(true);$('#exportAll').onclick=()=>download('BANKFLOW-state.json',JSON.stringify(backup(),null,2),'application/json');$('#importAll').onchange=async e=>{try{restore(JSON.parse(await e.target.files[0].text()));applyTheme();applyRail();notify('Данные импортированы')}catch(err){notify(err.message)}e.target.value=''}}
 bindFiles();return true;
}
function applyRail(){document.body.classList.toggle('rail-closed',readStore('collapsed',false));$('#collapse').setAttribute('aria-expanded',String(!readStore('collapsed',false)))}
function initStudio(){
 applyTheme();applyRail();$('#theme').onclick=()=>applyTheme(true);$('#collapse').onclick=()=>{writeStore('collapsed',!readStore('collapsed',false));applyRail()};
 $('#present').onclick=()=>{if(SUBJECTS.some(s=>s.id===subject))defenseRoute='#/'+subject+'/demo/'+lab;defenseStep=0;location.hash='/defense'};
 const dialog=$('#finder'),input=$('#findText');
 function search(){const q=input.value.trim().toLocaleLowerCase('ru');const items=[...allSubjects().map(s=>[s.title,'Дисциплина',routeFor(s)]),...entries().map(e=>[e.title,e.s.short+' · '+e.n,e.route]),...Object.keys(FILES).map(k=>[FILES[k].name,k,null,k])].filter(x=>x.slice(0,2).join(' ').toLocaleLowerCase('ru').includes(q)).slice(0,40);
 $('#matches').innerHTML=items.map(([title,meta,href,file])=>href?'<a class="list-item" href="'+esc(href)+'"><span><b>'+esc(title)+'</b><small>'+esc(meta)+'</small></span></a>':'<button class="list-item" data-file="'+esc(file)+'"><span><b>'+esc(title)+'</b><small>'+esc(meta)+'</small></span></button>').join('')||'<p class="empty">Совпадений нет</p>';bindFiles()}
 $('#globalSearch').onclick=()=>{input.value='';search();dialog.showModal();input.focus()};input.oninput=search;$('#matches').onclick=()=>dialog.close();document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!dialog.open)$('#globalSearch').click()}});
}
