"""Локальный учебный сервер: Python 3.10+, SQLite, без зависимостей."""
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path
import sqlite3, json, argparse
ROOT=Path(__file__).resolve().parents[1]
DB=ROOT/'data/bankflow.sqlite3'
def init_db():
    if not DB.exists():
        with sqlite3.connect(DB) as c:
            c.executescript((ROOT/'database/schema.sql').read_text(encoding='utf-8')+(ROOT/'database/seed.sql').read_text(encoding='utf-8'))
def get_clients(q=''):
    with sqlite3.connect(DB) as c:
        c.row_factory=sqlite3.Row
        # SQLite LIKE регистронезависим только для ASCII; casefold для русского.
        c.create_function('casefold',1,lambda s:s.casefold() if s else '')
        return [dict(r) for r in c.execute("SELECT * FROM clients WHERE instr(casefold(name || ' ' || city || ' ' || segment),?)>0 ORDER BY id",(q.casefold(),))]
class Handler(BaseHTTPRequestHandler):
    def send(self,body,typ,code=200):
        if isinstance(body,str):body=body.encode('utf-8')
        self.send_response(code);self.send_header('Content-Type',typ);self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    def do_GET(self):
        p=urlparse(self.path)
        if p.path in ('/','/index.html'):
            self.send((ROOT/'index.html').read_bytes(),'text/html; charset=utf-8')
        elif p.path=='/api/health':self.send(json.dumps({'status':'ok','database':'SQLite'}),'application/json')
        elif p.path=='/api/clients':self.send(json.dumps(get_clients(parse_qs(p.query).get('q',[''])[0]),ensure_ascii=False),'application/json; charset=utf-8')
        else:self.send('Not found','text/plain',404)
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--host',default='127.0.0.1');ap.add_argument('--port',type=int,default=8000);a=ap.parse_args();init_db();print(f'BANKFLOW: http://{a.host}:{a.port}');ThreadingHTTPServer((a.host,a.port),Handler).serve_forever()
