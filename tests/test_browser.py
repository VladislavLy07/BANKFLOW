from playwright.sync_api import sync_playwright
from pathlib import Path
import subprocess,sys,time,urllib.request,json,sqlite3,os,tempfile
P=Path(__file__).resolve().parents[1]; errors=[];log=[]
with sync_playwright() as w:
 browser=w.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1280,'height':850},accept_downloads=True)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content((P/'index.html').read_text()); page.wait_for_selector('.subject-card');assert page.locator('.subject-card').count()==7
 page.screenshot(path=str(P/'tests'/'preview.png'),full_page=False)
 for s in ['db','vmip','iis','isit','design','server','std']:
  page.locator(f'[data-nav="{s}"]').click(); page.wait_for_selector('#content .panel');
  if s=='db':
   page.locator('#search').fill('Орлова'); assert 'Найдено 4' in page.locator('#count').inner_text();page.locator('#search').fill('неттакого');assert 'Найдено 0' in page.locator('#count').inner_text();page.locator('#search').fill('');
  if s=='vmip':assert '112' in page.locator('#calcResult').inner_text();page.locator('#months').fill('1');assert '101' in page.locator('#calcResult').inner_text()
  if s=='iis':assert '361' in page.locator('#content').inner_text();page.locator('#datasetMode').select_option('raw');assert 'Пропуск' in page.locator('#dataset').inner_text();
  if s=='isit':
   page.locator('#role').select_option('operator');assert 'Запрещено' in page.locator('#rights').inner_text();page.locator('#grantToggle').click();assert page.locator('#rights').inner_text().count('Запрещено')==6
   for i in range(1,4):page.locator('#labSelect').select_option(str(i));page.wait_for_selector('#isitLab h3')
   page.locator('#labSelect').select_option('2');page.locator('#queryChoice').select_option('4');assert 'Анна Орлова' in page.locator('#queryResult').inner_text()
  if s=='design':
   for i in range(3):page.locator('#labSelect').select_option(str(i));page.wait_for_selector('#designLab h3')
  if s=='server':
   for i in range(9):page.locator('#labSelect').select_option(str(i));page.wait_for_selector('#serverLab h3');
   page.locator('#labSelect').select_option('0');assert 'Палиндром: да' in page.locator('#exResult').inner_text()
  if s=='std':
   for i in range(8):page.locator('#labSelect').select_option(str(i));page.wait_for_selector('#stdLab h3')
  page.locator('[data-tab="labs"]').click();assert page.locator('.lab-card').count()>0
  page.locator('[data-tab="code"]').click();assert page.locator('.file-row').count()>0
  page.locator('[data-tab="deliver"]').click();
  with page.expect_download() as d:page.get_by_text('Скачать комплект ZIP',exact=False).click()
  assert d.value.suggested_filename.endswith('.zip')
  log.append(s+': nav / demo / labs / files / zip OK')
 page.locator('[data-nav="audit"]').click();assert 'ОФП/СМГ' in page.locator('#main').inner_text();page.locator('[data-check="0"]').check();assert page.locator('[data-check="0"]').is_checked()
 page.set_viewport_size({'width':800,'height':1200});page.locator('[data-nav="home"]').click();assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.set_viewport_size({'width':390,'height':844});page.locator('[data-nav="home"]').click();assert page.evaluate('document.documentElement.scrollWidth <= innerWidth');page.screenshot(path=str(P/'tests'/'mobile.png'),full_page=True)
 page.locator('[data-nav="db"]').click();assert page.evaluate('document.documentElement.scrollWidth <= innerWidth');
 browser.close()
assert not errors,errors
# start real server and test API/database
tmp=tempfile.TemporaryDirectory(); db=Path(tmp.name)/'test.sqlite3'
p=subprocess.Popen([sys.executable,str(P/'backend/server.py'),'--port','8765','--db',str(db)],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
try:
 for _ in range(30):
  try:
   with urllib.request.urlopen('http://127.0.0.1:8765/api/health') as r: assert json.load(r)['database']=='SQLite';break
  except Exception:time.sleep(.1)
 else:raise RuntimeError('server failed')
 from urllib.parse import quote
 with urllib.request.urlopen('http://127.0.0.1:8765/api/clients?q='+quote('орлова')) as r:assert len(json.load(r))==4
 with sqlite3.connect(db) as c:
  assert c.execute('PRAGMA foreign_key_check').fetchall()==[]
  assert c.execute('SELECT COUNT(*) FROM requests').fetchone()[0]==360
  assert c.execute('SELECT COUNT(*) FROM clients').fetchone()[0]==60
 log.append('SQLite API / 4 tables / FK integrity OK')
finally:p.terminate();p.wait();tmp.cleanup()
print('\n'.join(log));print('Browser errors:',errors)
