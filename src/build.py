from pathlib import Path
import json,base64,zipfile,shutil,csv,mimetypes
P=Path(__file__).resolve().parents[1]; O=P.parent; subjects=json.loads((P/'src/subjects.json').read_text());data=json.loads((P/'src/demo-data.json').read_text());
with (P/'modules/03-iis/requests_clean.csv').open(encoding='utf-8') as f:
 data['clean']=[{**r,'id':int(r['id']),'client_id':int(r['client_id']),'employee_id':int(r['employee_id']),'product_id':int(r['product_id']),'hours':float(r['hours'])} for r in csv.DictReader(f)]
files={};
def add(p,subject):
 k=str(p.relative_to(P));mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream';b=p.read_bytes(); binary=p.suffix in ['.png','.zip','.sqlite3','.docx','.pdf']; files[k]={'name':p.name,'subject':subject,'mime':mime,'encoding':'base64' if binary else 'text','content':base64.b64encode(b).decode() if binary else b.decode('utf-8')}
for s in subjects:
 for p in sorted((P/'modules'/s['folder']).rglob('*')):
  if p.is_file() and '__pycache__' not in p.parts:add(p,s['id'])
for p in sorted((P/'data').glob('*.csv')):add(p,'iis' if p.name=='requests_raw.csv' else 'db')
for p in sorted((P/'database').glob('*.sql')):add(p,'db')
for p in sorted((P/'docs').glob('*.md')):add(p,'all')
add(P/'backend/server.py','db')
# individual zip kits are self-contained in same root layout. Include relevant shared files.
(P/'exports').mkdir(exist_ok=True)
for s in subjects:
 paths=list((P/'modules'/s['folder']).glob('*')); paths=[p for p in paths if p.is_file()]
 if s['id']=='db':paths+=list((P/'database').glob('*.sql'))+list((P/'data').glob('*.csv'))+[P/'backend/server.py'];
 if s['id']=='iis':paths+=[P/'data/requests_raw.csv']
 if s['id']=='std':paths+=[P/'modules/05-design/project.md']
 z=P/'exports'/f"{s['folder']}.zip"
 with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as f:
  for p in paths:f.write(p,str(p.relative_to(P)))
  if s['id']=='db':f.write(P/'modules/01-databases/demo.html','index.html')
  f.writestr('START_HERE.txt',f"BANKFLOW: {s['title']}\n{s['teacher']}\nУчебный комплект: {s['status']}\n{s['next']}\nОткройте README.md или главный документ в modules/{s['folder']}.\n")
 add(z,s['id'])
# escape script closing tags inside embedded downloadable source
j=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
header='const SUBJECTS='+j(subjects)+';\nconst DATA='+j(data)+';\nconst FILES='+j(files)+';'
js=(P/'modules/06-server/exercises.js').read_text()+'\n'+(P/'modules/06-server/lab-solutions.js').read_text()+'\n'+(P/'src/app.js').read_text()
html=(P/'src/template.html').read_text().replace('__CSS__',(P/'src/style.css').read_text()).replace('__DATA__',header).replace('__JS__',js)
(P/'index.html').write_text(html,encoding='utf-8');(O/'BANKFLOW_v1.html').write_text(html,encoding='utf-8');

print('HTML bytes',len(html.encode()),'embedded files',len(files))
