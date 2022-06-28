import {Duration, Stack, StackProps, Tags} from "aws-cdk-lib";
import {Construct} from "constructs";
import {DOCKER_PATH, env_config, getName, projectName} from "../config";
import {DockerImageAsset} from "aws-cdk-lib/aws-ecr-assets";
import {ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {CfnEndpoint, CfnEndpointConfig, CfnModel} from "aws-cdk-lib/aws-sagemaker";
import {s3Stack} from "@bin/lib/s3";
import {Code, Function} from "aws-cdk-lib/aws-lambda";


export interface LambdaSagemakerStackProps extends StackProps {
    initialVariantWeight: number;
    memorySizeInMb?: number;
    maxConcurrency?: number;
    instanceType?: string;
    initialInstanceCount?: number;
    apiUrl?: string;
    framework: 'tensorflow' | 'pytorch' | 'custom';
    frameworkVersion: string;
}

const dockerFilePath: { [key: string]: string } = {
    tensorflow: 'tensorflow2.Dockerfile',
    pytorch: 'pytorch.Dockerfile',
}

const getDockerFile = (framework: string, id: string) => {
    if (framework === 'custom') {
        return `model/${id}/Dockerfile`
    } else {
        return dockerFilePath[framework]
    }
}

export class LambdaSagemakerStack extends Stack {
    lambdaFunction: Function;
    constructor(scope: Construct, id: string, props: LambdaSagemakerStackProps) {
        super(scope, getName(id), props);

        //region sagemakerExecutionRole
        const sagemakerExecutionRole = new Role(this, getName(id, 'sagemakerExecutionRole'), {
            roleName: getName(id, 'sagemaker-exec-role'),
            assumedBy: new ServicePrincipal('sagemaker.amazonaws.com')
        })

        sagemakerExecutionRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'));
        sagemakerExecutionRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));
        sagemakerExecutionRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonTextractFullAccess'));
        sagemakerExecutionRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'));
        //endregion

        //region DockerImageAsset
        const asset = new DockerImageAsset(this, getName(id, 'DockerImageAsset'), {
            directory: DOCKER_PATH,
            file: getDockerFile(props.framework, id),
            buildArgs: {
                fs_version: props.frameworkVersion,
                model_id: id,
            },
            exclude: [
                '!model',
                `!model/${id}`,
                '!setup',
                `!setup/${id}`
            ]
        })
        //endregion

        //region sagemaker model
        const model = new CfnModel(this, getName(id, 'sagemakerModel'), {
            executionRoleArn: sagemakerExecutionRole.roleArn,
            modelName: getName(id),
            primaryContainer: {
                image: asset.imageUri,
                modelDataUrl: s3Stack.bucket.urlForObject(`${id}.tar.gz`)
            }
        })
        //endregion

        //region sagemaker endpoint config
        const serverlessConfig = props.memorySizeInMb && props.maxConcurrency ? {
            memorySizeInMb: props.memorySizeInMb,
            maxConcurrency: props.maxConcurrency
        } : undefined;
        const endpointConfig = new CfnEndpointConfig(this, getName(id, 'endpoint-cfg'), {
            endpointConfigName: getName(id, 'endpoint-cfg'),

            productionVariants: [{
                initialVariantWeight: props.initialVariantWeight,
                modelName: model.attrModelName,
                variantName: getName(id),
                instanceType: props.instanceType,
                initialInstanceCount: props.initialInstanceCount,
                serverlessConfig,
            }]
        });

        Tags.of(endpointConfig).add('Name', getName(id, 'endpoint-cfg'));
        Tags.of(endpointConfig).add('project', projectName);
        //endregion

        //region sagemaker endpoint
        const endpoint = new CfnEndpoint(this, getName(id, 'endpoint'), {
            endpointConfigName: endpointConfig.attrEndpointConfigName,
            endpointName: getName(id, 'endpoint'),
        });

        Tags.of(endpoint).add('Name', getName(id, 'endpoint'));
        Tags.of(endpoint).add('project', projectName);
        //endregion

        //region api gateway invoke sagemaker endpoint by lambda
        this.lambdaFunction = new Function(this, getName(id, 'invoke-lfn'), {
            code: Code.fromAsset('./lambda/code'),
            functionName: getName(id),
            handler: 'sagemaker.handler',
            runtime: env_config.lambdaRuntime,
            timeout: Duration.seconds(30),
            environment: {
                'ENDPOINT_NAME': endpoint.attrEndpointName
            }
        })

        this.lambdaFunction.addToRolePolicy(new PolicyStatement({
                actions: ['sagemaker:InvokeEndpoint'],
                resources: [endpoint.ref]
            }
        ))
        //endregion
    }
}