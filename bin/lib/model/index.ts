import {LambdaSagemakerStack, LambdaSagemakerStackProps} from "@bin/lib/base/lambda-sagemaker";
import {app} from "@bin/app";
import {baseProps} from "@bin/lib/config";
import {configModels} from './config'
import {LambdaIntegration} from "aws-cdk-lib/aws-apigateway";
import {apiStack} from "@bin/lib/api-gateway";
import {LambdaRedirectStack, LambdaRedirectStackProps} from "@bin/lib/base/lambda-redirect";


configModels.forEach(config => {
    const lambdaStack = config.request_url ? new LambdaRedirectStack(app, config.id, {
            ...baseProps,
            ...config
        } as LambdaRedirectStackProps) :
        new LambdaSagemakerStack(app, config.id, {
            ...baseProps,
            ...config
        } as LambdaSagemakerStackProps)
    if (app.node.tryGetContext("enable-api-gateway") && apiStack && !config.removed) {
        const resource = apiStack.api.root.addResource(config.apiUrl)
        resource.addMethod('POST', new LambdaIntegration(lambdaStack.lambdaFunction));
    }
})