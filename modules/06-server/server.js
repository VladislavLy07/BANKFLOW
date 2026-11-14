const express=require('express');
const path=require('path');
const app=express();
app.get('/',(req,res)=>res.send(`<!DOCTYPE html><html lang="ru"><meta charset="utf-8"><title>BANKFLOW · Express</title><style>body{font:20px system-ui;background:#eef3fa;padding:40px;color:#123469}figure{margin:0}img{width:320px;max-width:100%}</style><h1>BANKFLOW — сервер Express</h1><figure><img src="/logo.svg" alt="Учебный знак BANKFLOW"><figcaption>Учебная система банковских обращений</figcaption></figure></html>`));
app.get('/logo.svg',(req,res)=>res.type('image/svg+xml').send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120"><rect width="320" height="120" rx="20" fill="#153b73"/><path d="M36 80L62 34H86L60 80Z" fill="#ff7424"/><text x="105" y="73" font-family="Arial" font-size="25" font-weight="bold" fill="white">BANKFLOW</text></svg>'));
app.get('/api/health',(req,res)=>res.json({status:'ok',lab:'Express 9'}));
app.listen(3000,'127.0.0.1',()=>console.log('http://127.0.0.1:3000'));
