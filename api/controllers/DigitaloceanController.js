/**
 * DigitaloceanController
 *
 * @description :: Server-side logic for managing digitaloceans
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /*jshint node: true */
 /*global sails  */
 'use strict';

 var DigitalOceanAPI = require('digitalocean-api');
 var Docker = require('dockerode');
 var api = new DigitalOceanAPI(process.env.DO_CLIENT_ID,process.env.DO_CLIENT_SECRET);
 var ssh_key=process.env.TRUNKS_PUB_KEY || ''; 

 module.exports = {
 	'new_server':function(req,res,next){
 		var server = {
 			name: 'trunks-test',
 			sizeId:'66',
 			imageId:'7354580',
 			regionId:'6',
 			optionals: {
 				ssh_key_ids:['432278']
 			}
 		}
 		api.dropletNew(server.name,
 			server.sizeId,
 			server.imageId,
 			server.regionId,
 			server.optionals,
 			function(err,node){
 				if(err){
 					sails.log.error(err);
 					return res.json(500,{error:'Cannot create instance'});
 				}
 				return res.json(200,node);
 			});
 	},
 	'docker_list_image':function(req,res,next){
 		var docker = new Docker({host: 'http://128.199.141.116', port: '4243'});
 		var options = {};
 		console.log(docker);
 		docker.listImages(function(dk_err,dk_data){
 			if(dk_err) {
 				return res.json(500, dk_err);
 			}
 			return res.json(200,dk_data);
 		});
 	},
 	'docker_build_image':function(req,res,next){
		console.log(req);
		return res.json(200); 		
		var dockerfile=__dirname +'/dockerfile.tar';
		console.log(dockerfile);

 		var docker = new Docker({host: 'http://128.199.141.116', port: '4243'});
 		docker.buildImage(dockerfile, {t: 'test'}, function(dk_err,dk_data){
 			if(dk_err) {
 				return res.json(500, dk_err);
 			}
 			dk_data.pipe(process.stdout, {end:true});
 			dk_data.on('end',function(){
 				return res.json(200,'Finished creating image');
 			});
 			
 		});
 		
 	},
 	'get_server':function(req,res,next){
 		var id = req.param('id');
 		api.dropletGet(id, function(err, node){
 			if(err){
 				sails.log.error(err);
 				return res.json(500,{error:'Cannot create instance'});
 			}
 			return res.json(200,node);
 		});

 	},
 	'ssh_add':function(req,res,next){
 		api.sshKeyAdd('test-key',ssh_key,function(err,data){
 			if(err){
 				return res.json(500,err);
 			}
 			return res.json(200,data);
 		});
 	},
 	'ssh_get_all':function(req,res,next){
 		api.sshKeyGetAll(function(err,data){
 			if(err){
 				return res.json(500,err);
 			}
 			return res.json(200,data);
 		});
 	},
 	'get_all':function(req,res,next){
 		api.dropletGetAll(function(err, droplets){
 			if(err){
 				return res.json(500,err);
 			}
 			return res.json(200,droplets);
 		});
 	},
 	'region_get_all':function(req,res,next){
 		api.regionGetAll(function(err, data){
 			if(err){
 				return res.json(500,err);
 			}
 			return res.json(200,data);
 		});
 	},
 	'image_get_all': function(req,res,next){
 		api.imageGetAll(function(err,data){
 			if(err){
 				return res.json(500,err);
 			}
 			return res.json(200,data);
 		});
 	},
 	'size_get_all': function(req,res,next){
 		api.sizeGetAll(function(err,data){
 			if(err){
 				return res.json(500,err);
 			}
 			return res.json(200,data);
 		});
 	}
 };

