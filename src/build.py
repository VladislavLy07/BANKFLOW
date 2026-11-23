from pathlib import Path
import json,base64,zipfile,shutil,csv,mimetypes
P=Path(__file__).resolve().parents[1]; subjects=json.loads((P/'src/subjects.json').read_text(encoding='utf-8'));data=json.loads((P/'src/demo-data.json').read_text(encoding='utf-8'));
with (P/'modules/03-iis/requests_clean.csv').open(encoding='utf-8') as f:
 data['clean']=[{**r,'id':int(r['id']),'client_id':int(r['client_id']),'employee_id':int(r['employee_id']),'product_id':int(r['product_id']),'hours':float(r['hours'])} for r in csv.DictReader(f)]
import runpy
data["schedule"],data["duration"]=runpy.run_path(str(P/"modules/07-standards/schedule.py"))["write_csv"]()
files={};
def add(p,subject):
 k=p.relative_to(P).as_posix();mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream';b=p.read_bytes(); binary=p.suffix in ['.png','.zip','.sqlite3','.docx','.pdf']; files[k]={'name':p.name,'subject':subject,'mime':mime,'encoding':'base64' if binary else 'text','content':base64.b64encode(b).decode() if binary else b.decode('utf-8')}
for s in subjects:
 for p in sorted((P/'modules'/s['folder']).rglob('*')):
  if p.is_file() and '__pycache__' not in p.parts:add(p,s['id'])
for p in sorted((P/'data').glob('*.csv')):add(p,'iis' if p.name=='requests_raw.csv' else 'db')
for p in sorted((P/'database').glob('*.sql')):add(p,'db')
# Only these repository documents belong in the learner catalog and PWA cache.
catalog_documents = ['08-physical-education.md', 'ARCHITECTURE.md', 'AUDIT.md']
for name in catalog_documents:
    add(P / 'docs' / name, 'all')
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
  def put(name,content):
   info=zipfile.ZipInfo(name,date_time=(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;f.writestr(info,content)
  for p in sorted(paths):put(p.relative_to(P).as_posix(),p.read_bytes())
  if s['id']=='db':put('index.html',(P/'modules/01-databases/demo.html').read_bytes())
  put('START_HERE.txt',f"BANKFLOW: {s['title']}\n{s['teacher']}\nУчебный комплект: {s['status']}\n{s['next']}\nОткройте README.md или главный документ в modules/{s['folder']}.\n")
 add(z,s['id'])
# Serve binary reports separately. Text previews and models also work with file://.
import hashlib
assets = P / 'assets'
assets.mkdir(exist_ok=True)
for record in files.values():
    if record['encoding'] == 'base64':
        del record['content']
register = json.loads((P / 'docs/strategy-v2/08_REQUIREMENTS_REGISTER.json').read_text())
payload = {'SUBJECTS': subjects, 'DATA': data, 'FILES': files, 'REGISTER': register}
def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))
(assets / 'catalog.js').write_text(''.join('const '+key+'='+compact(value)+';\n' for key,value in payload.items()))
scripts = ['assets/catalog.js','modules/06-server/exercises.js','modules/06-server/lab-solutions.js','src/workspace.js','src/standards.js','src/studio.js','src/laboratory.js','src/app.js']
styles = ['src/style.css','src/studio.css']
html = (P/'src/template.html').read_text().replace('__JS__',''.join('<script src="./'+f+'"></script>' for f in scripts)).replace('__CSS__',''.join('<link rel="stylesheet" href="./'+f+'">' for f in styles))
(P/'index.html').write_text(html)
shell = sorted(set(scripts + styles + list(files) + ['index.html','manifest.webmanifest','kanygin.html','icon.svg','icon-192.png','icon-512.png']))
shell += sorted(f.relative_to(P).as_posix() for f in (assets / 'fonts').glob('*.woff2'))
(assets / 'public-files.json').write_text(compact(shell))
digest = hashlib.sha256()
for path in shell:
    digest.update(path.encode())
    digest.update((P/path).read_bytes())
worker = (P/'src/sw.template.js').read_text().replace('__VERSION__',digest.hexdigest()[:12]).replace('__ASSETS__',compact(['./']+['./'+f for f in shell]))
(P/'sw.js').write_text(worker)

# Optional portable build for a single-file handoff.
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--standalone', type=Path, metavar='HTML')
standalone = parser.parse_args().standalone
if standalone:
    binary = {k:base64.b64encode((P/k).read_bytes()).decode() for k,f in files.items() if f['encoding']=='base64'}
    code = 'const EMBEDDED='+compact(binary)+';\n'+'\n'.join((P/f).read_text() for f in scripts)
    portable = (P/'src/template.html').read_text().replace('__CSS__','<style>'+'\n'.join((P/f).read_text() for f in styles)+'</style>').replace('__JS__','<script>'+code.replace('</script', '<\\/script')+'</script>')
    for font in (assets/'fonts').glob('*.woff2'):
        portable = portable.replace('../assets/fonts/'+font.name,'data:font/woff2;base64,'+base64.b64encode(font.read_bytes()).decode())
    standalone.write_text(portable)
