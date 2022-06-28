const {yargs} = require("../initYargs");
const {exec} = require("child_process");
const color = require("ansi-colors");
const {cdkConfigPath} = require("../process/create");
yargs.command('local <id>', 'Run model on docker local', cfg => cfg,
  args => {
    try {
      const model_id = args.id
      const config = require(`${cdkConfigPath}/${model_id}.json`)
      const docker_file = config.framework === 'tensorflow' ? 'tensorflow2.Dockerfile' : config.framework === 'pytorch' ? 'pytorch.Dockerfile' : `model/${args.id}/Dockerfile`
      const fs_version = config.frameworkVersion
      const child = exec(`docker-compose up --build sagemaker_local`, {
        env: {
          ...process.env,
          model_id,
          docker_file,
          fs_version
        }
      })
      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)
      process.on("SIGINT", () => child.kill('SIGINT'))
    } catch (e) {
      console.log(color.red(`ERROR: system error`))
      console.error(e)
    }
  }
)