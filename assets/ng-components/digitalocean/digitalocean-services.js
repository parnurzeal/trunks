'use strict';

angular.module('myApp.digitalocean.digitalocean-services', [])

.factory('digitaloceanAPIservice',function($http) {
	return {
		region_get_all: function(){
			return $http({method: 'GET', url:'/digitalocean/region_get_all'});
		},
		image_get_all: function(){
			return $http({method: 'GET', url:'/digitalocean/image_get_all'});
		},
		docker_list_image: function(){ 
			return $http({method: 'GET', url:'/digitalocean/docker_list_image'});
		},
	};
});
