# Actism

Run Extism plug-ins as a pipeline on GitHub Actions. 

### Example


```yaml
name: test action

on:
  push:
  pull_request:

jobs:
  ci_example_pipelines:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dylibso/actism@main
        id: actism-image
        with:
          wasi: true
          input: "this is a test"
          output_type: text
          steps: |- # line-delimited set of named plugin calls, where "step()" export is ran
            count vowels | https://github.com/extism/plugins/releases/latest/download/count_vowels.wasm | count_vowels
            convert output to image data | https://cdn.modsurfer.dylibso.com/api/v1/module/271d6599df5fc1c54ddc33c266840123636d2c886e5064a739324f92ae8fc5ac.wasm
            generate png | https://cdn.modsurfer.dylibso.com/api/v1/module/2c9eb901052b1e6397d2414bdb796975407cc87085e6b5fe9564932538d8af51.wasm | handle
      - name: check output
        run: |
          echo '${{steps.actism-image.outputs.output}}' | jq '.value' | base64 -d -i > out.png
      - uses: actions/upload-artifact@v4
        with:
          name: out.png
          path: ./out.png

      - uses: ./
        id: actism-text
        with:
          wasi: true
          input: "this is a test"
          output_type: text
          steps: |- # line-delimited set of named plugin calls, where "step()" export is ran
            count vowels | https://github.com/extism/plugins/releases/latest/download/count_vowels.wasm | count_vowels
      - name: check output
        run: |
          echo '${{steps.actism-text.outputs.output}}' | grep '"count":4'
```

The above step with `id` "actism-image" will count the vowels in the input, convert that to a known format for the image generator, and then use the total count from the first plugin to generate an image with the value encoded. Then the output (out.png) will be uploaded to the summary artifacts on the Action run. 

You can combine Extism plug-ins and arbitrary GitHub Action steps to execute pipelines to do anything.

## Next Steps

The Extism plug-ins should get host functions that wrap the convenient `@actions/core` and `@actions/github` JavaScript package functions, so a plug-in could interact with GitHub Actions more directly. 