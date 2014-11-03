/**
 * DockerController
 *
 * @description :: Server-side logic for managing dockers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /*jshint node: true */
 /*global sails  */
 'use strict';

var Docker = require('dockerode');

module.exports = {
	 'docker_build_image':function(req,res,next){
	 	var dk_host = req.param('host');
	 	var dk_port = req.param('port');
	 	var tag = req.param('tag');
	 	console.log(dk_host, dk_port, tag);
	 	console.log(req.files);
	 	req.file('dockerfile').upload({
	 		maxBytes: 100000000
	 	}, function whenDone(err, uploadedFiles){
	 		if (err) return res.seruploadedFilesverError(err);
	 		var dockerfile = uploadedFiles[0].fd;
	 		console.log('Dockerfile'+dockerfile);
	 		var docker = new Docker({host: dk_host, port: dk_port});
	 		console.log('Docker Object'+ docker);
	 		docker.buildImage(dockerfile, {t: tag}, function(dk_err,dk_data){
	 			if(dk_err) {
	 				console.log(dk_err);
	 				return res.json(500, dk_err);
	 			}
	 			dk_data.pipe(process.stdout, {end:true});
	 			dk_data.on('end',function(){
	 				return res.json(200,'Finished creating image');
	 			});
	 		});
	 	});
 	},
 	'docker_run':function(req,res,next){
 		var dk_host = req.param('host');
	 	var dk_port = req.param('port');
 		var tag = req.param('tag');
 		var app_port = req.param('app_port');
 		var map_port = req.param('map_port');
 		var port_bindings = {}
 		port_bindings[app_port+'/tcp'] = [{HostPort:map_port}];
 		console.log(port_bindings);
 		var docker = new Docker({host: dk_host, port: dk_port});
 		docker.createContainer({
 			Image: tag,
 			name: tag
 		},function(err, container){
 			container.attach({
 				stream: true,
 				stdout: true,
 				stderr: true,
 				tty: true
 			}, function(err, stream){
 				if(err) {
 					return res.json(500, err);
 				}
 				stream.pipe(process.stdout);
 				container.start({
 					Privileged: true,
 					PortBindings : port_bindings
 					//PublishAllPorts: true
 				}, function(err,data){
 					if(err) {
 						return res.json(err);
 					}
 					return res.json(200,'Finished starting container');
 				});
 			})
 		});
 	},
 	'docker_build_image_cAdvisor':function(req,res,next){
 		var dk_host = req.param('host');
 		var dk_port = req.param('port');
 		var tag = 'my-cadvisor';
 		var docker = new Docker({host: dk_host, port: dk_port});
 		var dockerfile = __dirname +'/../../docker/cAdvisor.tar.gz'
 		docker.buildImage(dockerfile,{t: tag}, function(dk_err,dk_data){
 			if(dk_err) {
 				console.log(dk_err);
 				return res.json(500, dk_err);
 			}
 			dk_data.pipe(process.stdout, {end:true});
 			dk_data.on('end',function(){
 				return res.json(200,'Finished creating image');
 			});
 		});
 	},
 	'docker_run_cAdvisor':function(req,res,next){
	 	var dk_host = req.param('host');
	 	var dk_port = req.param('port');
 		var tag = 'my-cadvisor';
 		var app_port = '8080';
 		var map_port = '8080';
 		var port_bindings = {}
 		port_bindings[app_port+'/tcp'] = [{HostPort:map_port}];
 		console.log(port_bindings);
 		var docker = new Docker({host: dk_host, port: dk_port});
 		docker.createContainer({
 			Image: tag,
 			Volumes: {
 				'/rootfs':{},
 				'/var/run':{},
 				'/sys':{},
 				'/var/lib/docker':{}
 			},
 			name: tag
 		},function(err, container){
 			container.attach({
 				stream: true,
 				stdout: true,
 				stderr: true,
 				tty: true
 			}, function(err, stream){
 				if(err) {
 					return res.json(500, err);
 				}
 				stream.pipe(process.stdout);
 				container.start({
 					Privileged: true,
 					PortBindings : port_bindings,
 					Binds:[
 						"/:/rootfs:ro", 
 						"/var/run:/var/run:rw",
 						"/sys:/sys:ro",
 						"/var/lib/docker/:/var/lib/docker:ro"
 					]
 					//PublishAllPorts: true
 				}, function(err,data){
 					if(err) {
 						return res.json(err);
 					}
 					return res.json(200,'Finished starting cAdvisor');
 				});
 			})
 		});
 	},
 	'docker_get_container_by_tag':function(req,res,next){
	 	var dk_host = req.param('host');
	 	var dk_port = req.param('port');
	 	var tag = req.param('tag');
	 	var docker = new Docker({host: dk_host, port: dk_port});
	 	var targetContainer;
	 	docker.listContainers(function (err, containers) {
	 		if(err){
	 			return res.json(500, err);
	 		}
	 		containers.forEach(function (containerInfo) {
	 			if(containerInfo.Names[0]==='/'+tag){
	 				targetContainer = containerInfo;
	 			}
	 		});
	 		if(targetContainer){
	 			return res.json(200,targetContainer);
	 		}
	 		return res.json(200,'Container not found');
	 	});	
 	},
};

