import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker'
import * as iam from 'aws-cdk-lib/aws-iam'
import {DockerImageAsset} from 'aws-cdk-lib/aws-ecr-assets'
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {env_config, getName} from "./config";
import {Cors, LambdaIntegration} from "aws-cdk-lib/aws-apigateway";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";


export interface CdkSagemakerModelEndpointsStackProps extends StackProps {
    readonly ecrRepository?: string;
    readonly modelEndpointName?: string;
    readonly modelDataUrl?: string;
    readonly modelInstanceType?: string;
    readonly modelInstanceCount?: number;
    readonly modelInitialVariantWeight: number;
    readonly modelInitialVariantName: string;
    readonly customName: string;
}


export class CdkSagemakerModelEndpointsStack extends Stack {
    constructor(scope: Construct, id: string, props: CdkSagemakerModelEndpointsStackProps) {
        super(scope, getName(id), props);

        const sagemakerExecutionRole = new iam.Role(this, `demoSagemakerExecutionRole-${props.customName}`, {
            roleName: `demoSagemakerExecutionRole-${props.customName}`,
            assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com')
        })

        sagemakerExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'));
        sagemakerExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));
        sagemakerExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonTextractFullAccess'));
        sagemakerExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'));


        const asset = new DockerImageAsset(this, `SagemakerImageDemo-${props.customName}`, {
            directory: path.join(__dirname, '../../app')
        })

        const modelName = `humanZombieModel-${props.customName}`

        const model = new sagemaker.CfnModel(this, `demoModelResource-${props.customName}`, {
            executionRoleArn: sagemakerExecutionRole.roleArn,
            modelName: modelName,
            primaryContainer: {
                image: asset.imageUri,
                modelDataUrl: props.modelDataUrl
            }
        })

        // create endpoint config
        const endpointConfigName = `endpointConfig-${props.customName}`;
        const endpointConfig = new sagemaker.CfnEndpointConfig(this, `demoEndpointConfigResource-${props.customName}`, {
            endpointConfigName: endpointConfigName,
            productionVariants: [{
                initialInstanceCount: props.modelInstanceCount,
                initialVariantWeight: props.modelInitialVariantWeight,
                instanceType: props.modelInstanceType,
                modelName: modelName,
                variantName: props.modelInitialVariantName
            }]
        });
        // wait model to complete
        endpointConfig.addDependsOn(model);

        // deploy endpoint, and write endpoint to lambda
        const endpoint = new sagemaker.CfnEndpoint(this, `demoEndpointResource-${props.customName}`, {
            endpointConfigName: endpointConfigName,
            endpointName: props.modelEndpointName + '-' + props.customName
        });
        // wait config
        endpoint.addDependsOn(endpointConfig);

        //lambda stack
        const sagemakerLfn = new lambda.Function(this, 'LambdaSagemakerStackTest', {
            code: lambda.Code.fromAsset('./lambda/code'),
            functionName: 'lambdaSagemakerTest',
            handler: 'sagemaker.handler',
            runtime: env_config.lambdaRuntime,
            environment: {
                'ENDPOINT_NAME': 'demoEndpoint-humanZombie-2'
            }
        })

        sagemakerLfn.addToRolePolicy(new PolicyStatement({
                actions: ['sagemaker:InvokeEndpoint'],
                resources: [endpoint.ref]
            }
        ))

        // //API Gateway stack
        const api = new apigateway.RestApi(this, `sagemakerTestApi-${props.customName}`, {
            restApiName: `sagemakerTestApi-${props.customName}`,
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                disableCache: true
            },
        });
        const resource = api.root.addResource('predict')
        resource.addMethod('POST', new LambdaIntegration(sagemakerLfn));
    }
}
