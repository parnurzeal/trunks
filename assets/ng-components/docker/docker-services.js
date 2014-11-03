'use strict';

angular.module('myApp.docker.docker-services', [])

.factory('dockerAPIservice',function($http) {
	return {
		get_container_info: function(host,port,tag){
			return $http({method: 'GET', url:'/docker/docker_get_container_by_tag?host='+host+'&port='+port+'&tag='+tag});
		},
		docker_run: function(host,port,tag,app_port,map_port){
			var param = '?host='+host+'&port='+port+'&tag='+tag+'&app_port='+app_port+'&map_port='+map_port;
			return $http({method: 'GET', url: '/docker/docker_run'+param})
		}
	};
});
