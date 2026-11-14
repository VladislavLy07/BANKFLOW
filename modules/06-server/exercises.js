// BANKFLOW · демонстрационные упражнения по материалам ЛР1–6.
// Это примеры, а не полное решение всех 45 пунктов.
function palindrome(s){const a=s.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');return a===[...a].reverse().join('');}
function triangle(a,b,c){if(Math.min(a,b,c)<=0||a+b<=c||a+c<=b||b+c<=a)throw Error('Некорректные стороны');const p=(a+b+c)/2;return Math.sqrt(p*(p-a)*(p-b)*(p-c));}
function primes(n){return Array.from({length:Math.max(0,n-1)},(_,i)=>i+2).filter(x=>{for(let j=2;j*j<=x;j++)if(x%j===0)return false;return true;});}
function bisect(f,a,b,eps=0.001){if(!Number.isFinite(a+b+eps)||eps<=0||a>=b||f(a)*f(b)>0)throw Error('Нет интервала смены знака');if(f(a)===0)return a;if(f(b)===0)return b;for(let i=0;i<100&&(b-a)>eps;i++){const m=(a+b)/2;if(f(m)===0)return m;if(f(a)*f(m)<=0)b=m;else a=m;}return(a+b)/2;}
function deepCopy(o){return JSON.parse(JSON.stringify(o));}
class Calculator{constructor(x=0){this.x=x;} add(y){this.x+=y;return this;} multiply(y){this.x*=y;return this;}}
function anagram(a,b){const f=s=>[...s.toLowerCase().replace(/\s/g,'')].sort().join('');return f(a)===f(b);}
function pairSum(a,t){const seen=new Set();for(const n of a){if(seen.has(t-n))return [t-n,n];seen.add(n);}return null;}
const exercises={palindrome,triangle,primes,bisect,deepCopy,Calculator,anagram,pairSum};
if(typeof module!=='undefined')module.exports=exercises;
