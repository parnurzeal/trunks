/**
 * CloudonlineController
 *
 * @description :: Server-side logic for managing cloudonlines
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /*jshint node: true */
 /*global sails  */
 'use strict';

 var request = require('superagent');
 var token = {
 	'X-Auth-Token': 'bf800fe3-ef4e-4d31-9caf-b1ddc54e79a4',
 };

 module.exports = {
 	'list_images':function(req,res,next){
 		request.get('https://api.cloud.online.net/images')
 		.set(token)
 		.end(function(sa_err,sa_res){
 			if(sa_err){
 				return res.json(500,sa_err);
 			}
 			return res.json(200,sa_res.body);
 		});
 	},
 	'get_organizations':function(req,res,next){
 		request.get('https://account.cloud.online.net/organizations')
 		.set(token)
 		.end(function(sa_err,sa_res){
 			if(sa_err){
 				return res.json(500,sa_err);
 			}
 			return res.json(200,sa_res.body);
 		});
 	},
 	'new_server':function(req,res,next){
 		var server ={
 			name:'test2',
 			image:'e6cdbc3f-5e9a-48f8-9335-494bac14befc',
 			tags: ['temporary', 'test'],
 			organization:'a6a92f39-67b3-4885-9408-873d5daa8f00'
 		};
 		request.post('https://api.cloud.online.net/servers')
 		.set(token)
 		.send(server)
 		.end(function(sa_err,sa_res){
 			if(sa_err){
 				return res.json(500,sa_err);
 			}
 			return res.json(200,sa_res.body);
 		});
 	}
 };

