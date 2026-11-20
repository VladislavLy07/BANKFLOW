let defenseRoute='',defenseStep=0;
const stagesOfDefense=['Цель работы','Постановка задачи','Исходные данные','Демонстрация','Результаты','Вывод','Код и документы'];
const savedLab=e=>readStore('experiments',{})[stageKey(e.s,e.i)];
function description(e){
 const work=REGISTER.subjects.find(s=>s.id===e.s.id)?.works[e.i];
 const book=e.s.id==='std'?stdBook()[e.n]:null;
 const input=e.s.id==='std'?({'1.1':'Справочная билетных касс · 17 этапов','1.2':'Справочная билетных касс · 17 этапов','1.3':'Справочная билетных касс · 17 этапов','1.4':'Гостиница','2.1':'15 000 операторов · 8 прогонов','2.2':'Первая группа 13, вторая 15, общих ошибок 5','2.3':'16 ч, 40 ошибок, C = 6, N₀ = 70, m = 4, p = 1400','3':'ISO/IEC TR 15846:1998'}[e.n]):e.s.lead;
 return {source:e.s.source,input,goal:book?.[0]?.text||e.title,task:e.detail,requirements:work?.remaining_evidence||e.s.next,variant:e.s.id==='std'?'Вариант № 3':'См. исходное задание',status:work?.assignment_state==='original_laboratory_file'?'Есть оригинал задания':'Демонстрация / уточнить ТЗ'};
}
const numberField=(id,label,value,min=0,step='any')=>'<label>'+esc(label)+'<input type="number" id="'+id+'" required min="'+min+'" step="'+step+'" value="'+value+'"></label>';
const originalPlan=()=>structuredClone(DATA.schedule);
let workingPlan;
function calculatePlan(rows){
 for(const row of rows){row.es=Math.max(0,...row.deps.map(id=>rows[id-1].ef));row.ef=row.es+row.dur}
 const days=Math.max(...rows.map(row=>row.ef));
 for(const row of [...rows].reverse()){const children=rows.filter(r=>r.deps.includes(row.id));row.lf=children.length?Math.min(...children.map(c=>c.ls)):days;row.ls=row.lf-row.dur;row.slack=row.ls-row.es}
 return days;
}
function enhanceModel(C,e){
 if(e.s.id==='std'&&e.i<3){
  const duration=C.querySelector('#stageDays');if(duration)duration.onchange=()=>{if(!duration.reportValidity())return;workingPlan[selectedStage-1].dur=duration.valueAsNumber;writeStore('planDurations',workingPlan.map(r=>r.dur));std(C);enhanceModel(C,e)};
 }
 if(e.s.id==='std'&&[4,5,6].includes(e.i)){
  const box=C.querySelector('#modelControls');if(!box)return;
  const fields=e.i===4?[['exposure','Время наблюдения, ч',.1]]:e.i===5?[['groupA','Первая группа',13,1,1],['groupB','Вторая группа',15,1,1],['common','Общие ошибки',5,1,1]]:[['hours','Время испытаний, ч',16],['bugs','Выявлено ошибок',40,1,1],['compression','Коэффициент сжатия',6,0.001],['initial','Первоначальные ошибки',70,1,1],['target','Заданная наработка',4,.001],['operators','Операторы',1400,1,1]];
  box.innerHTML='<div class="model-fields">'+fields.map(f=>numberField(...f)).join('')+'</div><output id="modelValue"></output>';
  function calc(){const values=fields.map(([k])=>$('#'+k).valueAsNumber),out=$('#modelValue');if(box.querySelector(':invalid')){out.textContent='Проверьте границы параметров';return}
   if(e.i===4){const rate=11/2.4;out.textContent='Условная интенсивность λ = '+fmt(rate)+' ч⁻¹. R(t) = '+Math.exp(-rate*values[0]).toFixed(6)}
   if(e.i===5){const [a,b,c]=values;if(c>Math.min(a,b)){out.textContent='Общих ошибок больше, чем нашла одна из групп';return}const total=a*b/c,seen=a+b-c;out.textContent='Оценка всего: '+fmt(total)+' · найдено: '+seen+' · осталось: '+fmt(total-seen)}
   if(e.i===6){const [t,n,c,n0,m,p]=values,v=3e-7,T0=p/(v*v*n0),T=T0*Math.exp(c*t/(n0*m/n*T0));out.textContent='При допущении V = 3 × 10⁻⁷: R(t) = '+Math.exp(-t/T).toPrecision(16)+' · вероятность отказа ≈ '+(-Math.expm1(-t/T)).toExponential(3)}
  }box.oninput=calc;calc();
 }
 if(e.s.id==='db'&&e.i===0){C.insertAdjacentHTML('beforeend','<section class="panel"><h3>CRUD · локальная учебная таблица</h3><p>Отдельный набор тестовых записей в этом браузере.</p><form id="sampleForm"><label>Название записи<input required maxlength="100" id="sampleName"></label><button class="tool">Сохранить запись</button></form><div id="sampleRows"></div></section>');let editing=null;
 const draw=()=>{const rows=readStore('specimens',[]);$('#sampleRows').innerHTML=rows.map(r=>'<div class="list-item"><span>'+esc(r.name)+'</span><button class="tool" data-edit="'+r.id+'">Изменить</button><button class="tool" data-remove="'+r.id+'">Удалить</button></div>').join('')||'<p class="empty">Добавьте первую запись.</p>';$('#sampleRows').onclick=event=>{const b=event.target;if(b.dataset.edit){editing=+b.dataset.edit;$('#sampleName').value=rows.find(r=>r.id===editing).name}if(b.dataset.remove){writeStore('specimens',rows.filter(r=>r.id!==+b.dataset.remove));editing=null;$('#sampleName').value='';draw()}}};$('#sampleForm').onsubmit=ev=>{ev.preventDefault();const rows=readStore('specimens',[]),name=$('#sampleName').value.trim();if(!name)return;const id=editing??Math.max(0,...rows.map(r=>r.id))+1;writeStore('specimens',[...rows.filter(r=>r.id!==id),{id,name}]);editing=null;ev.target.reset();draw()};draw()}
 if(e.s.id==='server'){C.insertAdjacentHTML('beforeend','<section class="panel"><h3>HTTP / API</h3><div class="model-fields"><label>Режим<select id="apiMode"><option value="demo">Демонстрационный ответ</option><option value="live">Реальный сервер текущего сайта</option></select></label><label>GET<select id="endpoint"><option>/api/health</option><option>/api/clients?q=Орлова</option></select></label></div><button class="tool" id="sendApi">Отправить GET</button><pre class="code" id="apiResult" aria-live="polite"></pre></section>');$('#sendApi').onclick=async()=>{const out=$('#apiResult'),path=$('#endpoint').value;if($('#apiMode').value==='demo'){out.textContent='Демо · 200\n'+JSON.stringify(path.endsWith('health')?{database:'демонстрационный снимок'}:DATA.clients.filter(c=>c.name.includes('Орлова')),null,2);return}out.textContent='Отправка запроса…';try{const r=await fetch(path,{signal:AbortSignal.timeout(6000)});if(!r.ok)throw Error('HTTP '+r.status);out.textContent='HTTP '+r.status+'\n'+JSON.stringify(await r.json(),null,2)}catch(err){out.textContent='Запрос завершился ошибкой: '+err.message+'. Для API запустите backend/server.py.'}}}
 if(e.s.id==='design'){
 const diagrams={'UML · классы':[['Клиент','Обращение','Исполнитель'],['1 → 0..*','0..* → 1'],['Карточка клиента и поиск','Продукт, приоритет и статус','Назначение сотрудника']],
 'BPMN · обработка обращения':[['Регистрация','Назначение','Закрытие'],['→','→'],['Оператор создаёт обращение','Менеджер выбирает исполнителя','Исполнитель завершает работу']]};
 C.insertAdjacentHTML('beforeend','<section class="panel"><h3>Схемы BANKFLOW · учебный прототип</h3><select aria-label="Тип схемы" id="diagramType">'+Object.keys(diagrams).map(n=>'<option>'+n+'</option>').join('')+'</select><div id="diagramNodes"></div><p id="nodeDetail"></p>'+actionLink('Открыть реестр обращений','#/workspace','text-link')+'</section>');
 const draw=()=>{const [nodes,edges,details]=diagrams[$('#diagramType').value];$('#diagramNodes').innerHTML=nodes.map((n,i)=>(i?'<small>'+edges[i-1]+'</small>':'')+'<button class="node tool" data-node="'+i+'">'+n+'</button>').join('');$('#nodeDetail').textContent=details[0];$('#diagramNodes').onclick=ev=>{if(ev.target.dataset.node)$('#nodeDetail').textContent=details[+ev.target.dataset.node]}};$('#diagramType').onchange=draw;draw()}
}
function inputs(C){return [...C.querySelectorAll('input[id],select[id]')].filter(el=>!['labSelect','stageDays','sampleName'].includes(el.id)&&el.type!=='file')}
function readResult(C,e){
 const pick=sel=>{const el=C.querySelector(sel);return (el?.innerText||el?.textContent||'').trim()};
 const primary={db:'#count',vmip:'#calcResult',iis:'.metrics',isit:'#queryResult, #rights, #emp',design:'#nodeDetail',server:'#exResult',std:'#modelValue, .stage-info'};
 return [pick('#apiResult'),pick(primary[e.s.id])||pick('#stdLab h4, #designLab h3, #serverLab h3, h2')||e.title].filter(Boolean).join('\n').slice(0,5000)
}
function demo(s){
 const C=$('#content'),e=entries().find(x=>x.s.id===s.id&&x.i===lab);if(!C||!e)return;
 const d=description(e),key=stageKey(s,lab),saved=savedLab(e);workingPlan??=originalPlan();
 const durations=readStore('planDurations',null);if(e.s.id==='std'&&e.i<3&&Array.isArray(durations)&&durations.length===workingPlan.length)durations.forEach((v,i)=>{if(Number.isInteger(v)&&v>0&&v<=365)workingPlan[i].dur=v});
 C.innerHTML='<div class="zone-switch">'+['Задание','Модель','Результаты'].map((v,i)=>'<button class="tool" data-zone="'+i+'">'+v+'</button>').join('')+'</div><div class="lab-grid" data-zone="1"><aside class="panel brief"><small>Задание · '+esc(e.n)+'</small><h3>'+esc(e.title)+'</h3><p>'+esc(d.task)+'</p><h4>Исходные данные</h4><p>'+esc(d.input)+'</p><h4>'+esc(d.variant)+'</h4><p>'+esc(d.status)+'</p><h4>Источник</h4><p>'+esc(d.source)+'</p><h4>К защите</h4><p>'+esc(d.requirements)+'</p></aside><div id="modelPane"></div><aside class="panel lab-result"><h3>Результаты</h3><output id="resultText"></output><label>Мой вывод<textarea id="labNote" rows="4"></textarea></label><div class="lab-buttons">'+['Запустить','Проверить','Сохранить','Экспортировать','Сбросить'].map((v,i)=>'<button class="'+(i===0?'btn':'tool')+'" data-op="'+i+'">'+v+'</button>').join('')+'</div><p id="labMessage" role="status"></p></aside></div>';
 const pane=$('#modelPane');legacyDemo(s,pane);enhanceModel(pane,e);$('#labNote').value=saved?.note||'';
 const restoreInputs=data=>{for(const el of inputs(pane)){if(!Object.hasOwn(data,el.id))continue;el.value=data[el.id];el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}))}};
 if(saved)restoreInputs(saved.inputs);
 const refresh=()=>{if(pane.isConnected)$('#resultText').textContent=readResult(pane,e)};refresh();pane.addEventListener('input',refresh);pane.addEventListener('change',refresh);pane.addEventListener('click',()=>queueMicrotask(()=>{if(pane.isConnected)refresh()}));
 const observer=new MutationObserver(()=>{if(pane.isConnected)refresh();else observer.disconnect()});observer.observe(pane,{childList:true,subtree:true,characterData:true});
 function snapshot(){return {title:e.title,inputs:Object.fromEntries(inputs(pane).map(el=>[el.id,el.value])),durations:e.s.id==='std'&&e.i<3?workingPlan.map(r=>r.dur):undefined,result:readResult(pane,e),note:$('#labNote').value,time:new Date().toISOString()}}
 C.querySelectorAll('[data-zone].tool').forEach(b=>b.onclick=()=>C.querySelector('.lab-grid').dataset.zone=b.dataset.zone);
 C.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{
 const msg=$('#labMessage');if(b.dataset.op==='4'){const all=readStore('experiments',{});delete all[key];if(e.s.id==='std'&&e.i<3){workingPlan=originalPlan();writeStore('planDurations',workingPlan.map(r=>r.dur))}writeStore('experiments',all);demo(s);return}
 const invalid=pane.querySelector('input:invalid:not(#sampleName)');if(invalid||pane.querySelector('#modelValue')?.textContent.includes('больше, чем')){msg.textContent='Проверьте входные параметры';invalid?.reportValidity();return}
 if(b.dataset.op==='0'){pane.querySelector('#runExercise')?.click();for(const el of inputs(pane))el.dispatchEvent(new Event('input',{bubbles:true}));refresh();msg.textContent='Модель обновлена'}
 if(b.dataset.op==='1'){
  refresh();let verdict='Проверены входные поля и наличие результата. Содержательный вывод сверьте с заданием.';
  if(e.s.id==='std'&&e.i<3){const ok=workingPlan.every(r=>r.slack>=0&&r.deps.every(id=>workingPlan[id-1].ef<=r.es));verdict=ok?'Зависимости соблюдены, резервы всех этапов неотрицательны.':'Нарушены зависимости плана.'}
  if(e.s.id==='std'&&e.i===5)verdict='Пересечение допустимо. Сравните оценку общего числа ошибок с числом уникальных.';
  if(e.s.id==='std'&&[4,6].includes(e.i))verdict='Параметры допустимы. Результат зависит от исходных допущений.';
  if(e.s.id==='iis'&&e.i===0)verdict=new Set(DATA.clean.map(r=>r.id)).size===DATA.clean.length&&DATA.clean.every(r=>r.hours>=0&&r.hours<=72)?'Очищенный набор: ID уникальны, длительности в диапазоне 0–72 ч.':'Найдены нарушения в наборе.';
  msg.textContent=verdict
 }
 if(b.dataset.op==='2'){if(e.s.id==='std'&&e.i<3)writeStore('planDurations',workingPlan.map(r=>r.dur));const ok=writeStore('experiments',{...readStore('experiments',{}),[key]:snapshot()});logActivity('Сохранение',e.title,e.route);msg.textContent=ok?'Результат сохранён в браузере':'Сохранено только до закрытия страницы'}
 if(b.dataset.op==='3')download(s.id+'-'+e.n+'.json',JSON.stringify(snapshot(),null,2),'application/json');
 });
 if(subject!=='defense')logActivity('Лабораторная',e.title,e.route);
}
function showDefense(){
 const all=entries(),e=all.find(x=>x.route===defenseRoute)||lastLab(),d=description(e),saved=savedLab(e);
 const body=[d.goal,d.task,d.variant+' · '+d.input+' · '+d.source,null,saved?.result||'Запустите демонстрацию и сохраните результат.',saved?.note||'Добавьте свой вывод в результатах лабораторной.',null];
 $('#main').innerHTML='<div class="defense-head"><small>Режим защиты · '+esc(e.s.short)+'</small>'+actionLink('В рабочую область',e.route,'tool')+'</div><div class="panel slide"><label>Работа<select id="defLab">'+all.map(x=>'<option value="'+x.route+'" '+(x.route===e.route?'selected':'')+'>'+esc(x.s.short+' · '+x.title)+'</option>').join('')+'</select></label><small>Этап '+(defenseStep+1)+' / 7</small><h1>'+esc(stagesOfDefense[defenseStep])+'</h1><h2>'+esc(e.title)+'</h2><div id="slideBody">'+(body[defenseStep]?'<p>'+esc(body[defenseStep])+'</p>':'')+'</div><div class="actions"><button class="tool" id="prevSlide" '+(defenseStep===0?'disabled':'')+'>← Назад</button><button class="btn" id="nextSlide" '+(defenseStep===6?'disabled':'')+'>Далее →</button><button class="tool" id="full">Полный экран</button></div></div>';
 if(defenseStep===3){lab=e.i;$('#slideBody').innerHTML='<div id="content"></div>';demo(e.s)}
 if(defenseStep===6){$('#slideBody').innerHTML=actionLink('Исходники и документы','#/'+e.s.id+'/code/0')+' <button class="tool" data-file="exports/'+e.s.folder+'.zip">Скачать комплект</button>';bindFiles()}
 $('#defLab').onchange=ev=>{defenseRoute=ev.target.value;defenseStep=0;showDefense()};$('#prevSlide').onclick=()=>{defenseStep--;showDefense()};$('#nextSlide').onclick=()=>{defenseStep++;showDefense()};$('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{notify('Полный экран недоступен в этом браузере')}};
}
