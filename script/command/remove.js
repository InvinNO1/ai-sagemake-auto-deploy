const color = require("ansi-colors");
const {yargs} = require("../initYargs");
const {exec_cmd} = require("../process/exec_cmd");
const fs = require("fs");
const {cdkConfigPath} = require("../process/create");
const {removeModel} = require("../process/remove");

yargs.command('remove <id>', 'Deploy model', cfg => {
    cfg
      .option('profile', {
        alias: 'p',
        description: 'Aws profile',
        demandOption: false
      })
      .option('env', {
        alias: 'e',
        description: 'Environment deploy name',
        demandOption: false
      })
      .option('region', {
        alias: 'r',
        description: 'AWS region',
        default: 'ap-northeast-1'
      })
      .option('all', {
        alias: 'a',
        type: 'boolean',
        description: 'Remove all',
        default: false
      })
  },
  async args => {
    try {
      const cdkContext = JSON.parse(fs.readFileSync("cdk.context.json"))
      const deploy_env = {
        env: {
          ...process.env,
          env: args.env,
          profile: args.profile,
          region: args.region,
          project_name: cdkContext.project_name
        }
      }

      const configPath = `${cdkConfigPath}/${args.id}.json`
      let config = fs.readFileSync(configPath, 'utf-8')
      config = config.replace(/"removed" *: *false/, '"removed": true')
      fs.writeFileSync(configPath, config)

      if ( args.profile && args.env) {
        if (cdkContext['enable-api-gateway']) {
          await exec_cmd(`npm run cdk --
        --require-approval never -e
        --context assets-ecr-repository-name=${args.env}-${cdkContext.project_name}-infra-repo
        --profile ${args.profile} deploy ${args.env}-${cdkContext.project_name}-api`, deploy_env)
        }

        await exec_cmd(`npm run cdk --
        --require-approval never -e -f
        --context assets-ecr-repository-name=${args.env}-${cdkContext.project_name}-infra-repo
        --profile ${args.profile} destroy ${args.env}-${cdkContext.project_name}-${args.id.replace(/_/g, '-')}`, deploy_env)
      }

      if (args.all) {
        removeModel(args.id)
      }
    } catch (e) {
      console.log(color.red(`ERROR: system error`))
      console.error(e)
    }
  }
)