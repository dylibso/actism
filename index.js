const core = require('@actions/core');
const github = require('@actions/github');
const createPlugin = require("@extism/extism");

async function actism(input, steps, wasi, outputType, test) {
  // get the input and all the steps to run, pass the input to the first and start the pipeline
  if (!input) {
    input = core.getInput('input');
  }
  if (!steps) {  
    steps = core.getInput('steps');
  }
  if (!wasi) {
    wasi = core.getBooleanInput('wasi');
  }
  if (!outputType) {
    outputType = core.getInput('output_type');
  }
  steps = steps.trim();
  outputType = outputType.trim();

  let githubToken;
  if (!test) {
    githubToken = core.getInput('github_token');
  }
  if (githubToken) {
    githubToken = githubToken.trim();
  }
    
  // for each step, run the step() function in the module with the input from the previous step
  let pipelineData = input;
  for (const step of Steps(steps)) {
    step.entrypoint = step.entrypoint.trim();
    step.name = step.name.trim();
    step.source = step.source.trim();
    if (test) {
      console.log("DEBUG:", step);
    }

    console.log(`Starting step: ${step.name} from ${step.source}`)
    const plugin = await createPlugin(step.source, { 
      useWasi: wasi, 
      functions: { "extism:host/user": ActionsBindings(githubToken) } 
    });
    const output = await plugin.call(step.entrypoint, pipelineData);
    pipelineData = output.bytes();
  }

  // set the output from the final step to return from the action
  let output = pipelineData;
  if (outputType === "text") {
    output = new TextDecoder().decode(pipelineData);
  }
  if (test) {
    console.log(output);
  } else {
    core.setOutput('output', output);
  }
}

const Steps = (input) => {
  return input.split(/\r|\n/).map(line => {
    if (line.length < 1) { return }

    const [name, source, entrypoint = 'run' ] = line.split('|');
    if (!name || !source) {
      throw new Error(`Invalid step: ${line}. Must follow "name | source" format, where source can be URL or path. Optionally set a third "| entrypoint" to specify the export function called.`);
    }

    return { name, source, entrypoint };
  })
}

const ActionsBindings = (githubToken) => {
  const hostFuncs = {};
  if (githubToken.length === 0) {
    throw new Error('GitHub API access token is missing')
  }
  const octokit = github.getOctokit({ 
    auth: githubToken,
    useAgent: 'dylibso/actism@main',
  });
  
  hostFuncs.github_context = (plugin) => {
    return pluginCaller.store("githubContext = " + JSON.stringify(github.context));
  };

  hostFuncs.github_open_issue = (plugin, titleOffs, bodyOffs) => {
    const title = plugin.read(titleOffs).text();
    const body = plugin.read(bodyOffs).text();
    octokit.rest.issues.create({
      ...github.context.repo,
      title,
      body
    });
  }
  
  return hostFuncs;
}

actism().catch(e => {
  core.setFailed(`Actism error: ${e}`);
});

module.exports = actism;
