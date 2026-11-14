"""BANKFLOW local educational server. Python 3.10+, standard library only.
No authentication: loopback by default; trust only your own LAN for --host 0.0.0.0.
"""
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path
from datetime import date
from contextlib import contextmanager
import sqlite3, json, argparse
ROOT=Path(__file__).resolve().parents[1]
DB=ROOT/'data/bankflow.sqlite3'
STATUSES={'Новое','В работе','Закрыто'}
PRIORITIES={'Обычный','Высокий'}
@contextmanager
def connect():
    c=sqlite3.connect(DB,timeout=10)
    c.row_factory=sqlite3.Row
    c.execute('PRAGMA foreign_keys=ON')
    try:
        with c: yield c
    finally: c.close()
def init_db():
    if not DB.exists():
        try:
            with connect() as c:
                c.executescript('BEGIN;\n'+(ROOT/'database/schema.sql').read_text(encoding='utf-8')+'\n'+(ROOT/'database/seed.sql').read_text(encoding='utf-8')+'\nCOMMIT;')
        except Exception:
            DB.unlink(missing_ok=True)
            raise
def get_clients(q=''):
    with connect() as c:
        c.create_function('casefold',1,lambda s:s.casefold() if s else '')
        return [dict(r) for r in c.execute("SELECT * FROM clients WHERE instr(casefold(name || ' ' || city || ' ' || segment),?)>0 ORDER BY id",(q.casefold(),))]
def get_requests():
    with connect() as c:
        return [dict(r) for r in c.execute('SELECT * FROM requests ORDER BY id DESC')]
def create_request(data):
    required=['client_id','employee_id','product_id']
    if not isinstance(data,dict) or any(type(data.get(k)) is not int or data[k]<=0 for k in required) or data.get('priority') not in PRIORITIES:
        raise ValueError('Invalid client, employee, product, or priority')
    with connect() as c:
        product=c.execute('SELECT category FROM products WHERE id=?',(data['product_id'],)).fetchone()
        if not product: raise ValueError('Unknown product')
        for table,key in [('clients','client_id'),('employees','employee_id')]:
            if not c.execute('SELECT 1 FROM '+table+' WHERE id=?',(data[key],)).fetchone():raise ValueError('Unknown '+key)
        cur=c.execute('INSERT INTO requests(client_id,employee_id,product_id,category,date,hours,status,priority) VALUES (?,?,?,?,?,?,?,?)', (data['client_id'],data['employee_id'],data['product_id'],product['category'],date.today().isoformat(),0,'Новое',data['priority']))
        return dict(c.execute('SELECT * FROM requests WHERE id=?',(cur.lastrowid,)).fetchone())
def update_request(id,data):
    if not isinstance(data,dict) or data.get('status') not in STATUSES:raise ValueError('Invalid status')
    with connect() as c:
        cur=c.execute('UPDATE requests SET status=? WHERE id=?',(data['status'],id))
        if not cur.rowcount:raise LookupError('Unknown request')
        return dict(c.execute('SELECT * FROM requests WHERE id=?',(id,)).fetchone())
STATIC={'/':'index.html','/index.html':'index.html','/manifest.webmanifest':'manifest.webmanifest','/icon.svg':'icon.svg','/icon-192.png':'icon-192.png','/icon-512.png':'icon-512.png','/sw.js':'sw.js'}
MIME={'.html':'text/html; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.js':'text/javascript; charset=utf-8'}
class Handler(BaseHTTPRequestHandler):
    def send(self,body,typ,code=200):
        if isinstance(body,str):body=body.encode('utf-8')
        self.send_response(code);self.send_header('Content-Type',typ);self.send_header('Content-Length',str(len(body)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.end_headers();self.wfile.write(body)
    def json(self,data,code=200):self.send(json.dumps(data,ensure_ascii=False),'application/json; charset=utf-8',code)
    def do_GET(self):
        p=urlparse(self.path)
        try:
            if p.path in STATIC:
                f=ROOT/STATIC[p.path]
                if f.is_file():self.send(f.read_bytes(),MIME[f.suffix]);return
            elif p.path=='/api/health':self.json({'status':'ok','database':'SQLite','version':'1.1'});return
            elif p.path=='/api/clients':self.json(get_clients(parse_qs(p.query).get('q',[''])[0]));return
            elif p.path=='/api/requests':self.json(get_requests());return
            self.json({'error':'Not found'},404)
        except (OSError,sqlite3.Error):self.json({'error':'Local server error'},500)
    def read_json(self):
        if self.headers.get('Content-Type','').split(';')[0].strip()!='application/json':raise ValueError('JSON required')
        n=int(self.headers.get('Content-Length','0'))
        if not 0<n<=4096:raise ValueError('Invalid body length')
        return json.loads(self.rfile.read(n))
    def write_allowed(self):
        # Block cross-origin browser writes. No CORS permissions are granted.
        origin=self.headers.get('Origin')
        if origin and urlparse(origin).netloc!=self.headers.get('Host'):raise ValueError('Cross-origin write rejected')
    def do_POST(self):
        if urlparse(self.path).path!='/api/requests':self.json({'error':'Not found'},404);return
        self.mutate(lambda: (create_request(self.read_json()),201))
    def do_PATCH(self):
        p=urlparse(self.path).path.split('/')
        if len(p)!=4 or p[1:3]!=['api','requests'] or not p[3].isdigit():self.json({'error':'Not found'},404);return
        self.mutate(lambda: (update_request(int(p[3]),self.read_json()),200))
    def mutate(self,action):
        try:
            self.write_allowed();result,code=action();self.json(result,code)
        except (ValueError,TypeError,UnicodeError,sqlite3.IntegrityError):self.json({'error':'Invalid request data'},400)
        except LookupError:self.json({'error':'Request not found'},404)
        except sqlite3.Error:self.json({'error':'Local database error'},500)
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--host',default='127.0.0.1');ap.add_argument('--port',type=int,default=8000);ap.add_argument('--db',type=Path,default=DB,help='Optional separate SQLite file for testing');a=ap.parse_args();DB=a.db.resolve();init_db();print(f'BANKFLOW: http://{a.host}:{a.port}');ThreadingHTTPServer((a.host,a.port),Handler).serve_forever()
