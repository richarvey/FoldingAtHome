import cdk = require('@aws-cdk/core');
import ec2 = require("@aws-cdk/aws-ec2");
import ecs = require("@aws-cdk/aws-ecs");
import iam = require('@aws-cdk/aws-iam');

export class CdkfoldingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "FoldingVPC", {
      maxAzs: 3, // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "FoldingCluster", {
      vpc: vpc,
    });

    // create a task definition with CloudWatch Logs
    const logging = new ecs.AwsLogDriver({
      streamPrefix: "foldingathome",
    })

    const taskDef = new ecs.FargateTaskDefinition(this, "FoldingAtHomeDefinition", {
      memoryLimitMiB: 8192,
      cpu: 4096,
    })
    
    taskDef.addContainer("FoldingAtHomeContainer", {
      image: ecs.ContainerImage.fromRegistry("richarvey/foldingathome"),
      logging,
    })

    // Instantiate ECS Service with just cluster and image
    new ecs.FargateService(this, "FoldingService", {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 10
    });

  }
}
