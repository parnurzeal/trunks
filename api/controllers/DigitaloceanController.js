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
 var api = new DigitalOceanAPI('52609a8763f0f8b2350e75333fddaffe','0a660d39f93476c567f97aa2750edd62');
 var ssh_key='ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCxBS40/Dz6qt9Vuz1gTeU3++SxD/aqlTdp40VBRbEpRNsZ7id8NLmQp3/Rl8hZukFnhp8Pbs6V3DHLcq8kkzpzDS1FT03bWsoYPpXxoETdYqKvxReKb/iNlhnJz7x5kDksX2Tq4ZB4NZjdbkBPJyeDx4GTYnrGeGOoQmO+LADN50QOEMxH3vKJY19U2+kb9gprxNlHCGidt+RhX/tEyvmwIJ7PqAVR6qfHubdX+aQE90xLj63qUyvM4ufYyPS1IMeSuyPQvUNnpytZnOmHfsXLof2mfxlbPSlQdgJODomsuRxsppJhG+vGHkvDWVBTVChk++ICbtVNMtzrroHVOciH parnurzeal@gmail.com';
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
 	'run_docker':function(req,res,next){

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

