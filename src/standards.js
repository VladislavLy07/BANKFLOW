const stdPath='modules/07-standards/';
let selectedStage=8;
const stdBook=()=>JSON.parse(FILES[stdPath+'solutions.json'].content);
function stdList(C,s){
 C.innerHTML='<section class="panel studies"><h2>Лабораторные работы</h2><a href="kanygin.html">Оглавление варианта № 3 и Word-отчёт</a>'+s.labs.map(([id,name,detail],i)=>`<a class="study-link" href="#/std/demo/${i}"><b>${id}</b><span><strong>${esc(name)}</strong><small>${esc(detail)}</small></span> →</a>`).join('')+questions(stdBook())+'</section>';
 bindQuestions(C);
}
function questions(book){
 const pairs=book.qa;return '<details class="study-notes"><summary>Вопросы к защите · 33</summary><input aria-label="Поиск по вопросам и ответам" placeholder="Найти вопрос или термин" class="q-search">'+pairs.map((p,i)=>i%2?'':`<details class="question"><summary>${esc(p.text)}</summary><p>${esc(pairs[i+1].text)}</p></details>`).join('')+'</details>';
}
function bindQuestions(C){const input=C.querySelector('.q-search');if(input)input.oninput=()=>C.querySelectorAll('.question').forEach(q=>q.hidden=!q.textContent.toLowerCase().includes(input.value.trim().toLowerCase()));}
function dayOfPlan(offset){let date=new Date(Date.UTC(2026,8,1));while(offset>0){date.setUTCDate(date.getUTCDate()+1);if(date.getUTCDay()%6!==0)offset--}return date.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',timeZone:'UTC'});}
function studyPlan(index,book){
 const rows=DATA.schedule,days=DATA.duration,chosen=rows[selectedStage-1],op=book['1.2'].find(x=>x.rows).rows;
 const stageButton=r=>`<button class="stage-button" data-stage="${r.id}" aria-pressed="${r.id===selectedStage}">${r.id}. ${esc(r.name)}</button>`;
 let diagram='';
 if(index===0)diagram='<div class="calendar">'+rows.map(r=>`<div class="calendar-line">${stageButton(r)}<button aria-label="Этап ${r.id}, ${r.dur} дн." data-stage="${r.id}" class="calendar-track"><span style="margin-left:${100*r.es/days}%;width:${100*r.dur/days}%;background:${r.slack?'#ad6820':'#315f91'}"></span></button><small>${dayOfPlan(r.es)}–${dayOfPlan(r.ef-1)}</small></div>`).join('')+'</div>';
 if(index===1)diagram=table(op[0],op.slice(1).map((row,i)=>[rows[i].id,rows[i].deps.join(', ')||'—',...row.slice(2,-1),dayOfPlan(rows[i].ef-1)]));
 if(index===2){
 const xy=[[45,55],[145,55],[245,55],[345,55],[445,55],[545,28],[545,91],[645,55],[645,160],[545,160],[445,160],[345,160],[245,160],[145,160],[700,265],[45,160],[45,265]];
 const edges=rows.flatMap((r,i)=>r.deps.map(j=>{const [x,y]=xy[j-1],[a,b]=xy[i],l=Math.hypot(a-x,b-y);return `<line x1="${x+21*(a-x)/l}" y1="${y+21*(b-y)/l}" x2="${a-23*(a-x)/l}" y2="${b-23*(b-y)/l}" stroke="#617a96" marker-end="url(#tip)"/>`;})).join('');
 diagram=`<div class="network-scroll"><svg viewBox="0 0 750 305" aria-label="Зависимости 17 этапов"><defs><marker id="tip" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#617a96"/></marker></defs>${edges}${rows.map((r,i)=>`<g role="button" aria-label="${esc(r.name)}, ${r.dur} дн." tabindex="0" data-stage="${r.id}" transform="translate(${xy[i]})"><circle r="20" fill="${r.id===selectedStage?'#cb591c':r.slack?'#697887':'#28547c'}"/><text fill="white" text-anchor="middle" dy="5">${r.id}</text></g>`).join('')}</svg></div><p>Номера узлов соответствуют этапам. Критические ветви проходят через этапы 6 и 7, затем сходятся в этапе 8.</p>`;
 }
 return '<p><strong>'+days+' рабочих дня</strong> · 17 этапов · Справочная билетных касс</p>'+diagram+`<label>Этап проекта <select id="pickStage">${rows.map(r=>`<option value="${r.id}" ${r.id===selectedStage?'selected':''}>${r.id}. ${esc(r.name)}</option>`).join('')}</select></label><p class="stage-info"><b>${esc(chosen.name)}</b> · ${esc(chosen.role)} · ${chosen.dur} дн. · ${dayOfPlan(chosen.es)}–${dayOfPlan(chosen.ef-1)}<br>Предшественники: ${chosen.deps.join(', ')||'нет'} · Резерв: ${chosen.slack} дн.</p><nav class="study-nav">${['Календарь','Оперограмма','Сеть'].map((x,i)=>`<a href="#/std/demo/${i}">${x}</a>`).join('')}</nav>`;
}
function modelResult(i){
 if(i===4){const times=[.2,.4,.8,.3,.1,.5,.3,.4],errors=[5,2,1,0,3,2,4,1],sum=a=>a.reduce((x,y)=>x+y,0),rate=sum(errors.slice(2))/sum(times.slice(2));return `<p>Расчёт при выбранной интерпретации прогонов. После восьмого прогона λ = ${rate.toFixed(6)} ч⁻¹. За 0,1 ч R = ${Math.exp(-rate*.1).toFixed(5)}.</p><svg viewBox="0 0 480 140" aria-label="Безотказность при t от нуля до часа"><path fill="none" stroke="#28547c" stroke-width="3" d="${Array.from({length:101},(_,k)=>(k?'L':'M')+(35+4.2*k)+' '+(110-100*Math.exp(-rate*k/100))).join(' ')}"/><text x="5" y="16">1</text><text x="5" y="114">0</text><text x="35" y="136">0 ч</text><text x="425" y="136">1 ч</text></svg>`;}
 if(i===5){const a=13,b=15,c=5,total=a*b/c,seen=a+b-c;return `<svg viewBox="0 0 460 110" aria-label="Распределение найденных ошибок"><ellipse cx="185" cy="52" rx="100" ry="45" fill="#c1ddea"/><ellipse cx="275" cy="52" rx="100" ry="45" fill="#e4c791" opacity=".7"/><g text-anchor="middle"><text x="140" y="58">${a-c}</text><text x="230" y="58">${c}</text><text x="320" y="58">${b-c}</text></g></svg><p>Найдено ${seen} уникальных · Оценка всего ${total} · Осталось ${total-seen}</p>`;}
 if(i===6){const v=3e-7,T0=1/((v/1400)*v*70),T=T0*Math.exp(6*16/(7*T0));return `<p>Условный результат при выбранных коэффициентах. R(16) = ${Math.exp(-16/T).toFixed(15)} · 1 − R ≈ ${(-Math.expm1(-16/T)).toExponential(2)}</p>`;}return '';
}
function std(C){
 const book=stdBook(),s=SUBJECTS.find(x=>x.id==='std'),[id,name]=s.labs[lab],blocks=book[id];
 const notes=blocks.slice(1).map(o=>o.rows?table(o.rows[0],o.rows.slice(1)):o.math?`<p class="math-line">${esc(o.math)}</p>`:`<p>${esc(o.text)}</p>`).join('');
 C.innerHTML=`<section class="panel studies"><a href="#/std/labs/0">← Все работы Каныгина</a>${selector(s,s.labs.map(l=>l[0]+' · '+l[1]))}<div id="stdLab"><small>Выполнение · вариант № 3</small><h3>${id}. ${esc(name)}</h3><h4>${esc(blocks[0].text)}</h4>${lab<3?studyPlan(lab,book):modelResult(lab)}<details class="study-notes" ${lab===3||lab===7?'open':''}><summary>${lab===3?'Техническое задание':lab===7?'Карточка стандарта':'Исходные данные, построение и вывод'}</summary>${notes}</details><details class="study-notes"><summary>Пример из методички</summary>${book.examples[id].map(src=>`<img alt="Иллюстрация преподавателя к работе ${id}" src="${src}">`).join('')}<button class="btn secondary" data-file="${stdPath}variant-3.docx">Открыть полную методичку с выполнением ↓</button></details>${lab===7?questions(book):''}<nav class="study-nav">${lab?'<a href="#/std/demo/'+(lab-1)+'">← Предыдущая работа</a>':''}${lab<7?'<a href="#/std/demo/'+(lab+1)+'">Следующая работа →</a>':''}</nav><button class="btn secondary" data-file="${stdPath}variant-3.docx">Скачать выполненный вариант в Word ↓</button></div></section>`;
 bindSelector();bindFiles();bindQuestions(C);
 function choose(n){selectedStage=Number(n);std(C);}
 C.querySelectorAll('[data-stage]').forEach(el=>{el.onclick=()=>choose(el.dataset.stage);if(el.tagName.toLowerCase()==='g')el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(el.dataset.stage)}}});
 if($('#pickStage'))$('#pickStage').onchange=e=>choose(e.target.value);
 if(lab===1)C.querySelectorAll('#stdLab .table-wrap:first-of-type tbody tr').forEach((r,i)=>{r.onclick=()=>choose(i+1);if(i+1===selectedStage)r.classList.add('selected-row')});
}
