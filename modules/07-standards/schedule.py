"""Учебный план по таблице 1.4 методички Каныгина; тема BANKFLOW условная.
Длительности и зависимости — проектные допущения. Не заменяет назначенный вариант.
"""
import csv
from pathlib import Path
TASKS=[
('Постановка задачи','Аналитик',1,[]),
('Сбор исходных данных','Аналитик',2,[1]),
('Анализ существующих методов и программных средств','Аналитик',2,[2]),
('Обоснование необходимости разработки','Аналитик',1,[3]),
('Определение и анализ требований','Аналитик',2,[4]),
('Структура входных и выходных данных','Аналитик',1,[5]),
('Выбор технических и программных средств','Разработчик',1,[5]),
('Согласование и утверждение технического задания','Руководитель',1,[6,7]),
('Проектирование программной архитектуры','Разработчик',2,[8]),
('Техническое проектирование компонентов','Разработчик',2,[9]),
('Программирование модулей','Разработчик',4,[10]),
('Тестирование программных модулей','Тестировщик',2,[11]),
('Сборка и испытание программы','Тестировщик',1,[12]),
('Анализ результатов испытаний','Тестировщик',1,[13]),
('Расчёты показателей безопасности жизнедеятельности','Аналитик',1,[8]),
('Экономические расчёты','Аналитик',1,[14,15]),
('Оформление пояснительной записки','Аналитик',2,[16]),
]
def calculate(tasks=TASKS):
    rows=[]
    for i,(name,role,dur,deps) in enumerate(tasks,1):
        start=max([rows[d-1]['ef'] for d in deps],default=0)
        rows.append(dict(id=i,name=name,role=role,dur=dur,deps=deps,es=start,ef=start+dur))
    finish=max(r['ef'] for r in rows)
    for r in reversed(rows):
        successors=[x for x in rows if r['id'] in x['deps']]
        r['lf']=min([x['ls'] for x in successors],default=finish);r['ls']=r['lf']-r['dur'];r['slack']=r['ls']-r['es']
    return rows,finish
def write_csv():
    rows,finish=calculate();out=Path(__file__).with_name('schedule17.csv')
    with out.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f,delimiter=';');w.writerow(['№','Работа','Исполнитель','Длительность','Предшественники','Начало (день)','Конец (день)','Позднее начало','Поздний конец','Резерв'])
        for r in rows:w.writerow([r['id'],r['name'],r['role'],r['dur'],','.join(map(str,r['deps'])),r['es']+1,r['ef'],r['ls']+1,r['lf'],r['slack']])
    out.with_name('plan.csv').write_bytes(out.read_bytes())
    return rows,finish
if __name__=='__main__':
    rows,finish=write_csv()
    print('Длительность:',finish,'дней. Критические работы:',[r['id'] for r in rows if r['slack']==0]);assert len(rows)==17 and all(r['slack']>=0 for r in rows)
