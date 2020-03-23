import cdk = require('@aws-cdk/core');
import ec2 = require("@aws-cdk/aws-ec2");
import ecs = require("@aws-cdk/aws-ecs");
import ecs_patterns = require("@aws-cdk/aws-ecs-patterns");
import iam = require('@aws-cdk/aws-iam');
import { Vpc, InstanceType } from '@aws-cdk/aws-ec2';
import { Cluster, ContainerImage, TaskDefinition, Compatibility, FargateTaskDefinition } from '@aws-cdk/aws-ecs';

export class CdkfoldingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /////////////////////////////////////////////
    //// Setup initial vars, vpc and cluster ////
    /////////////////////////////////////////////

    // Create a VPC
    const vpc = new ec2.Vpc(this, "FoldingVPC", {
      maxAzs: 3, // Default is all AZs in region
    });

    // Create a ECS cluster
    const cluster = new ecs.Cluster(this, "FoldingCluster", {
      vpc: vpc,
    });

    // Our Image for FoldingAtHome
    const folding_image = ecs.ContainerImage.fromRegistry("richarvey/foldingathome");

    // Setup CloudWatch Logs
    const logging = new ecs.AwsLogDriver({
      streamPrefix: "foldingathome",
    });

    ////////////////////
    // ECS on Fargate //
    ////////////////////

    // Fargate Task Definition
    const fargatetaskDef = new ecs.FargateTaskDefinition(this, "FoldingAtHomeDefinition", {
      memoryLimitMiB: 8192,
      cpu: 4096,
    });
    
    fargatetaskDef.addContainer("FoldingAtHomeContainer", {
      image: folding_image,
      logging,
    });

    // Create an ECS on Fargate Service
    const FargateFoldingService = new ecs.FargateService(this, 'FoldingService', {
        cluster,
        taskDefinition: fargatetaskDef,
    });

    // Setup Fargate Service AutoScaling policy
    const scaling = FargateFoldingService.autoScaleTaskCount({
        minCapacity: 5,
        maxCapacity: 10
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: 50,
        scaleInCooldown: cdk.Duration.seconds(300),
        scaleOutCooldown: cdk.Duration.seconds(60)
    });

    ////////////////
    // ECS on EC2 //
    ////////////////

    // EC2 TaskDefinition
    //const ec2taskDef = new TaskDefinition(this, 'ec2Task', {
    //  compatibility: Compatibility.EC2,
    //  memoryMiB: '1024',
    //  cpu: '4096',
    //});

    //ec2taskDef.addContainer('FoldingAtHomeContainer', {
    //    image: folding_image,
    //    memoryLimitMiB: 1024,
    //    logging,
    //});

    //// On-demand Instances (standard asg with launch config)
    //cluster.addCapacity('AsgOnDemand', {
    //    maxCapacity: 2,
    //    minCapacity: 1,
    //    instanceType: new InstanceType('c4.2xlarge'),
    //});

    // Spot Instances (standard asg with launch config)
    //const asgspot = cluster.addCapacity('AsgSpot', {
    //    maxCapacity: 4,
    //    minCapacity: 2,
    //    instanceType: new InstanceType('t3.2xlarge'),
    //    spotPrice: '0.12', // calculated from eu-west-1 - move to launch template later
    //    spotInstanceDraining: true
    //});

    // Scale instances up/down based on utilisation
    //asgspot.scaleOnCpuUtilization('asg-cpu-scaling', {
    //    targetUtilizationPercent: 80,
    //});

    // Create an ECS on EC2 Service
    //const EC2FoldingService = new ecs.Ec2Service(this, 'ec2FoldingService', {
    //    cluster,
    //    taskDefinition: ec2taskDef,
    //});

    // Setup ECS on EC2 AutoScaling
    //const scaling_ecs = EC2FoldingService.autoScaleTaskCount({
    //     minCapacity: 4,
    //     maxCapacity: 8
    //});
    //scaling_ecs.scaleOnCpuUtilization('ec2TaskCpuScaling', {
    //    targetUtilizationPercent: 50,
    //    scaleInCooldown: cdk.Duration.seconds(300),
    //    scaleOutCooldown: cdk.Duration.seconds(60)
    //});

  }
}
