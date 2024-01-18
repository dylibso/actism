const actism = require('./index');

const input = 'This is a test';
const steps = 'count vowels | https://github.com/extism/plugins/releases/latest/download/count_vowels.wasm | count_vowels';
const wasi = true;
const outputType = "text";
const test = true;

actism(input, steps, wasi, outputType, test).catch(e => {
  if (test) {
    console.error(e);
  } else {
    core.setFailed(`Actism error: ${e}`);
  }
});
