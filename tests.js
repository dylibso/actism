const actism = require('./index');

const input = 'This is a test';
const steps = 'count vowels | https://github.com/extism/plugins/releases/latest/download/count_vowels.wasm | count_vowels';
const wasi = true;
const outputType = "json";
const test = true;

actism(input, steps, wasi, outputType, test)

const bindingsTestSteps = 'test context binding | https://cdn.modsurfer.dylibso.com/api/v1/module/43829261bce87598314e32fb809b13a6def0c2a602c742f9ca7b8fc0267ae2f7.wasm';
actism('', bindingsTestSteps, true, "text", test);