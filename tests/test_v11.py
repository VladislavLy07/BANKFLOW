"""Regression tests introduced in release 1.1, updated for 1.2. No production database is modified."""
from pathlib import Path
import tempfile, subprocess, sys, time, urllib.request, urllib.error, json, sqlite3
from playwright.sync_api import sync_playwright
P=Path(__file__).resolve().parents[1]
PORT=8766; base=f'http://127.0.0.1:{PORT}'
with tempfile.TemporaryDirectory() as tmp:
 db=Path(tmp)/'test.sqlite3'
 p=subprocess.Popen([sys.executable,str(P/'backend/server.py'),'--port',str(PORT),'--db',str(db)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:
  for _ in range(40):
   try:
    with urllib.request.urlopen(base+'/api/health') as r:assert json.load(r)['version']=='1.2';break
   except Exception:time.sleep(.1)
  else:raise RuntimeError('Server did not start')
  def api(path,data=None,method='GET',headers=None):
   h={'Content-Type':'application/json',**(headers or {})}
   req=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,method=method,headers=h)
   try:
    with urllib.request.urlopen(req) as r:return r.status,json.load(r)
   except urllib.error.HTTPError as e:return e.code,json.load(e)
  assert len(api('/api/requests')[1])==360
  bad={'client_id':9999,'employee_id':1,'product_id':1,'priority':'Высокий'}
  assert api('/api/requests',bad,'POST')[0]==400
  good={**bad,'client_id':1}
  assert api('/api/requests',good,'POST',{'Origin':'https://untrusted.example'})[0]==400
  status,new=api('/api/requests',good,'POST');assert status==201 and new['id']==361 and new['status']=='Новое'
  assert api('/api/requests/361',{'status':'bad'},'PATCH')[0]==400
  assert api('/api/requests/9999',{'status':'Закрыто'},'PATCH')[0]==404
  assert api('/api/requests/361',{'status':'Закрыто'},'PATCH')[1]['status']=='Закрыто'
  with sqlite3.connect(db) as c:assert c.execute('SELECT status FROM requests WHERE id=361').fetchone()[0]=='Закрыто';assert not c.execute('PRAGMA foreign_key_check').fetchall()
  print('API: create, update, persistence, foreign keys, invalid input and cross-origin write rejection OK')
  with sync_playwright() as w:
   browser=w.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);ctx=browser.new_context(viewport={'width':390,'height':844},accept_downloads=True);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   # The current browser sandbox blocks direct local HTTP navigation. Exercise the actual compiled UI in-memory with a storage shim and a bridge to the real local API.
   def bridge(path,method,body):
    code,data=api(path,json.loads(body) if body else None,method)
    return {'code':code,'data':data}
   page.expose_function('apiBridge',bridge)
   shim="""<script>window.__storage={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__storage[k]??null,setItem:(k,v)=>window.__storage[k]=String(v)}});window.fetch=async (path,opts={})=>{const r=await window.apiBridge(path,opts.method||'GET',opts.body||null);return {ok:r.code<400,status:r.code,json:async()=>r.data}};</script>"""
   page.set_content((P/'index.html').read_text().replace('<body>','<body>'+shim,1));page.evaluate("server=true;setRoute('workspace')");page.wait_for_function("document.querySelector('#workCount')?.textContent.includes('361')");page.locator('#requestForm button[type=submit]').click();page.wait_for_function("document.querySelector('#workMessage')?.textContent.includes('362')");page.locator('[data-req-id="362"]').select_option('В работе');page.wait_for_function("document.querySelector('#workMessage')?.textContent.includes('Статус сохранён')");page.locator('[data-nav="home"]').click();page.locator('[data-nav="workspace"]').click();page.wait_for_function("document.querySelector('[data-req-id=\"362\"]')?.value==='В работе'");assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
   page.locator('#workSearch').fill('362');assert page.locator('#workCount').inner_text()=='Найдено: 1'
   with page.expect_download() as d:page.locator('#exportWork').click()
   assert d.value.suggested_filename=='bankflow-requests.csv'
   page.locator('[data-nav="audit"]').click();page.locator('.progress-subject summary').first.click();page.locator('[data-stage]').first.select_option('Готово к показу');page.locator('[data-nav="home"]').click();assert '1 из' in page.locator('.progress-panel').inner_text()
   page.locator('[data-nav="audit"]').click()
   with page.expect_download() as d:page.locator('#exportProgress').click()
   saved=Path(tmp)/'saved.json';d.value.save_as(str(saved));assert 'Готово к показу' in json.loads(saved.read_text())['progress'].values()
   page.locator('#importProgress').set_input_files(str(saved));page.wait_for_function("document.querySelector('#progressMessage')?.textContent.includes('импортирован')")
   page.evaluate("server=false;setRoute('workspace')");page.locator('#requestForm button[type=submit]').click();assert '361' in page.locator('#workMetrics').inner_text();page.locator('[data-req-id="361"]').select_option('Закрыто');page.locator('[data-nav="home"]').click();page.locator('[data-nav="workspace"]').click();assert page.locator('[data-req-id="361"]').input_value()=='Закрыто';assert '361' in page.evaluate("window.__storage['bankflow:v1.1:requests']")
   page.evaluate("setRoute('std','demo',2)");assert '32 рабочих дня' in page.locator('#stdLab').inner_text();assert page.evaluate("location.hash.includes('std/demo/2')");page.evaluate("readRoute();render()");assert '32 рабочих дня' in page.locator('#stdLab').inner_text();assert not errors,errors
   page.screenshot(path=str(P/'tests'/'v11-mobile.png'),full_page=False)
   print('Browser (storage shim/API bridge): live SQLite workspace, status persistence, CSV, progress export/import, demo storage, routes, 390px OK');browser.close()
 finally:p.terminate();p.wait()
