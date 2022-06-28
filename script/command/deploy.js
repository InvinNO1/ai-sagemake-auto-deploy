const color = require("ansi-colors");
const {yargs} = require("../initYargs");
const {readFileSync} = require("fs");
const {exec_cmd} = require("../process/exec_cmd");
const {uploadWeight} = require("../process/upload_weight");

yargs.command('deploy <id>', 'Deploy model', cfg => {
    cfg
      .option('profile', {
        alias: 'p',
        description: 'Aws profile',
        demandOption: true
      })
      .option('env', {
        alias: 'e',
        description: 'Environment deploy name',
        demandOption: true
      })
      .option('update-weight', {
        alias: 'u',
        type: 'boolean',
        default: false,
        description: 'Update weight and config'
      })
      .option('region', {
        alias: 'r',
        description: 'AWS region',
        default: 'ap-northeast-1'
      })
  },
  async args => {
    try {
      const cdkContext = JSON.parse(readFileSync("cdk.context.json"))
      const deploy_env = {
        env: {
          ...process.env,
          env: args.env,
          profile: args.profile,
          region: args.region,
          project_name: cdkContext.project_name
        }
      }
      await exec_cmd(`npm run cdk --  
      --require-approval never -e
      --context assets-ecr-repository-name=${args.env}-${cdkContext.project_name}-infra-repo 
      --profile ${args.profile} deploy ${args.env}-${cdkContext.project_name}-bucket`, deploy_env)

      if (args.u) {
        const bucket = `${args.env}-${cdkContext.project_name}-bucket`
        await uploadWeight(args.id, bucket, args.region, args.profile)
        console.log('Upload weight and config success !')
      }
      await exec_cmd(`npm run cdk --  
      --require-approval never -e
      --context assets-ecr-repository-name=${args.env}-${cdkContext.project_name}-infra-repo 
      --profile ${args.profile} deploy ${args.env}-${cdkContext.project_name}-${args.id.replace(/_/g, '-')}`, deploy_env)

      if (cdkContext['enable-api-gateway']) {
        await exec_cmd(`npm run cdk --  
        --require-approval never -e
        --context assets-ecr-repository-name=${args.env}-${cdkContext.project_name}-infra-repo 
        --profile ${args.profile} deploy ${args.env}-${cdkContext.project_name}-api`, deploy_env)
      }
    } catch (e) {
      console.log(color.red(`ERROR: system error`))
      console.error(e)
    }
  }
)