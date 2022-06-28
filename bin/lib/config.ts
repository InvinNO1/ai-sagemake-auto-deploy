import {Environment} from "aws-cdk-lib/core/lib/environment";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {StackProps} from "aws-cdk-lib";

export const projectName: string = process.env.project_name || ''
export const profile: string | undefined = process.env.profile
export const region: string  = process.env.region || 'ap-northeast-1'
export const ENV: string = process.env.env || 'prod'
export const DOCKER_PATH = 'docker'

export const env_config: EnvConfig = {
  cdkEnv: {
    region,
    account: '338050856162'
  } as Environment,
  defaultZone: 'ap-northeast-1a',
  lambdaRuntime: Runtime.PYTHON_3_8
}

export interface EnvConfig {
  cdkEnv: Environment
  defaultZone: string
  lambdaRuntime: Runtime
}

export const getName = (...baseName: string[]) => {
  return `${ENV}-${projectName}-${baseName.join('-')}`.replace(/_/g, '-')
}

export const baseProps: StackProps = {
  env: env_config.cdkEnv,
  tags: {
    project: projectName
  }
}