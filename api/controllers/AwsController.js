/**
 * AwsController
 *
 * @description :: Server-side logic for managing aws
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /*jshint node: true */
 /*global sails  */
 'use strict';

var AWS = require('aws-sdk');

module.exports = {
	'new_server': function(req,res,next){
		// set key
		var aws_key = {
			'accessKeyId':'AKIAIFSQWT7ICWPVFSVA',
			'secretAccessKey':'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',
		};
		AWS.config.update(aws_key);
		// set region
		var region ={ region: 'ap-northeast-1'};
		AWS.config.update(region);
		// lock down api version
		AWS.config.apiVersions = { ec2: '2014-09-01'};
		// initiate ec2
		var ec2 = new AWS.EC2();
		// set instance params
		var params = {
			ImageId: 'ami-df4b60de',
			InstanceType: 't1.micro',
			MinCount: 1, MaxCount:1 
		};
		ec2.runInstances(params, function(err, data){
			if (err) {
				console.log('Could not create instance', err);
				console.log(this.request.httpRequest.endpoint);
				return res.json(500,err)
			}
			console.log(data);
			var instanceId = data.Instances[0].InstanceId;
			console.log('Create instance', instanceId);
			// add tags
			params = {Resources: [instanceId], Tags: [
					{ Key: 'Name', Value: 'Test1'}
				]};
			ec2.createTags(params, function(err){
				console.log('Tagging instance');
				if(err){
					return res.json(500,err);	
				}
				return res.json(200,'Done creating and tagging instance');	
			});
		});
	}
};

