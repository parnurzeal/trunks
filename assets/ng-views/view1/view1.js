'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'ng-views/view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope,digitaloceanAPIservice) {
	console.log("adfasdf");
	console.log(digitaloceanAPIservice);
	digitaloceanAPIservice.region_get_all()
	.success(function(data){
		console.log(data);
	})
	.error(function(res, status){
		console.log(res,status);
	});
	digitaloceanAPIservice.image_get_all()
	.success(function(data){
		console.log(data);
	})
	.error(function(res, status){
		console.log(res,status);
	});
	digitaloceanAPIservice.docker_list_image()
	.success(function(data){
		console.log(data);
	})
	.error(function(res, status){
		console.log(res,status);
	});
});
