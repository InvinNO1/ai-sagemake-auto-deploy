import {Stack, StackProps, Tags} from "aws-cdk-lib";
import {Construct} from "constructs";
import {baseProps, getName, projectName} from "./config";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {app} from "@bin/app";

class S3Stack extends Stack {
    public bucket: Bucket;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        this.bucket = new Bucket(this, getName(id), {
            bucketName: getName('bucket'),

        });
        Tags.of(this.bucket).add('Name', getName('bucket'));
        Tags.of(this.bucket).add('project', projectName);
    }
}

export const s3Stack = new S3Stack(app, getName('bucket'), baseProps)