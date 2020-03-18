#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CdkfoldingStack } from '../lib/cdkfolding-stack';

const app = new cdk.App();
new CdkfoldingStack(app, 'CdkfoldingStack');
