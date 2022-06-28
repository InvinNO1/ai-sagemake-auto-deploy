import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {env_config, getName} from "../config";
import {Code, Function} from "aws-cdk-lib/aws-lambda";
import {PythonFunction} from "@aws-cdk/aws-lambda-python-alpha";


export interface LambdaRedirectStackProps extends StackProps {
    request_url: string
}


export class LambdaRedirectStack extends Stack {
    lambdaFunction: Function;

    constructor(scope: Construct, id: string, props: LambdaRedirectStackProps) {
        super(scope, getName(id), props);

        //region api gateway invoke sagemaker endpoint by lambda
        this.lambdaFunction = new PythonFunction(this, getName(id, 'invoke-lfn'), {
            entry: './lambda/http_request',
            functionName: getName(id),
            handler: 'handler',
            index: 'index.py',
            runtime: env_config.lambdaRuntime,
            timeout: Duration.seconds(30),
            environment: {
                'ENDPOINT_URL': props.request_url
            }
        })
        //endregion
    }
}