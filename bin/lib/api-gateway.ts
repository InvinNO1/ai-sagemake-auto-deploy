import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Cors, MethodLoggingLevel, RestApi} from "aws-cdk-lib/aws-apigateway";
import {baseProps, ENV, getName} from "./config";
import {app} from "@bin/app";

export interface ApiGatewayStackProps extends StackProps {
    restApiName: string
}

class ApiGatewayStack extends Stack {
    public api: RestApi;

    constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
        super(scope, getName(id), props);
        this.api = new RestApi(this, getName(id), {
            restApiName: props.restApiName,
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                disableCache: true
            },
            deployOptions: {
                stageName: ENV,
                loggingLevel: MethodLoggingLevel.INFO
            }
        });
    }
}

export let apiStack: ApiGatewayStack | null = null
if (app.node.tryGetContext("enable-api-gateway")) {
    apiStack = new ApiGatewayStack(app, 'api', {
        ...baseProps,
        restApiName: getName('api')
    } as ApiGatewayStackProps)
}