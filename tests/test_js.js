const assert=require('node:assert/strict');
const {JS_LABS,displayResult}=require('../modules/06-server/lab-solutions.js');
let count=0;for(const l of JS_LABS)for(const t of l.tasks){assert.doesNotThrow(()=>displayResult(t[2]()));count++;}
assert.equal(count,47);assert.equal(JS_LABS[0].tasks[0][2](),Infinity);assert.equal(JS_LABS[1].tasks[3][2]()[0],16);assert.deepEqual(JS_LABS[5].tasks[6][2](),[true,false]);console.log('47 task executions OK');
