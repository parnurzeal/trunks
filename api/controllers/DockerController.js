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
	 	req.file('dockerfile').upload({
	 		maxBytes: 100000000
	 	}, function whenDone(err, uploadedFiles){
	 		if (err) return res.serverError(err);
	 		var dockerfile = uploadedFiles[0].fd;
	 		console.log(dockerfile);
	 		var docker = new Docker({host: dk_host, port: dk_port});
	 		docker.buildImage(dockerfile, {t: 'test'}, function(dk_err,dk_data){
	 			if(dk_err) {
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
 			Image: tag
 		},function(err, container){
 			container.attach({
 				stream: true,
 				stdout: true,
 				stderr: true,
 				tty: true
 			}, function(err, stream){
 				if(err) return;
 				stream.pipe(process.stdout);
 				container.start({
 					Privileged: true,
 					PortBindings : port_bindings
 					//PublishAllPorts: true
 				}, function(err,data){
 					if(err) return;
 				});
 			})
 		});
 	}
};

