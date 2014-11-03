'use strict';

angular.module('myApp.home', ['ngRoute','ngUpload'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'ng-views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', function($scope,$http,digitaloceanAPIservice,dockerAPIservice) {

  $scope.targets = [];
  $scope.testInfo = {};

  $scope.concurrencyList = _.range(1, 50, 5);

  $scope.requestNumList = [ 1, 10, 50, 100, 500, 1000, 5000, 10000, 50000 ];

  // test chart data
  $scope.myData = [10,20,30,40,60];

  $scope.showResult = false;
  $scope.showTesting = false;

  // get all default options
  digitaloceanAPIservice.region_get_all()
  .success(function(data){
    $scope.regions = data;
  })
  .error(function(res, status){
    console.log(res,status);
  });

  digitaloceanAPIservice.size_get_all()
  .success(function(data){
    $scope.sizes = data;
  })
  .error(function(res, status){
    console.log(res,status);
  });

  digitaloceanAPIservice.image_get_all()
  .success(function(data){
    // $scope.images = data;
  })
  .error(function(res, status){
    console.log(res,status);
  });

  digitaloceanAPIservice.docker_list_image()
  .success(function(data){
    // $scope.docker_images = data;
  })
  .error(function(res, status){
    console.log(res,status);
  });


  $scope.addDigitalOceanInstance = function(res) {
    // build image
    var instance = {
      type: 'digitalocean',
      name: $scope.doForm.name,
      clientId: $scope.doForm.clientId,
      clientSecret: $scope.doForm.clientSecret,
      region: $scope.doForm.region,
      size: $scope.doForm.size,
      // dockerfile: submit file to api
      testURL: $scope.doForm.testURL,
      // load testing job to be scheduled
      job: null
    };

    // callback after build api finished
    done();

    function done() {
      $scope.targets.push(instance);
      $scope.doForm = {};
    }
  };

  // add default value
  $scope.gdForm={};
  $scope.gdForm.host = 'http://128.199.141.116';
  $scope.gdForm.port = '4243';
  $scope.gdForm.tag = 'test';
  $scope.gdForm.app_port = '8080';
  $scope.gdForm.map_port = '11022';
  $scope.gdForm.testURL = 'http://128.199.141.116:11022';

  $scope.addGeneralDockerInstance = function(res) {
    console.log(res);
    if (res instanceof Error) {
      console.error('Error:', res);
      return;
    }
    // build image
    var instance = {
      type: 'general',
      host: $scope.gdForm.host,
      port: $scope.gdForm.port,
      tag: $scope.gdForm.tag,
      app_port: $scope.gdForm.app_port,
      map_port: $scope.gdForm.map_port,
      testURL: $scope.gdForm.testURL,
      // load testing job to be scheduled
      job: null
    };

    done();
    function done() {
      dockerAPIservice.docker_run(instance.host,instance.port,instance.tag, instance.app_port, instance.map_port)
      .success(function(data){
        console.log(data);
        console.log(instance);
        dockerAPIservice.get_container_info(instance.host,instance.port,instance.tag)
        .success(function(data){
          console.log(data);
          instance['containerId'] = data.Id;
          instance['containerName'] = data.Names[0];
          $scope.targets.push(instance);
        })
        .error(function(res, status){
          console.log(res,status);
        });
      })
      .error(function(res, status){
        console.log(res,status);
      });
    }
  };

  $scope.runTest = function() {
    $scope.showTesting = true;
    // $scope.testInfo.progress = 0;
    $scope.jobs = [];
    // var count = 0;
    console.log($scope.targets);


    async.mapSeries(

      $scope.targets,

      function(target, cb) {
        console.log(target);
        var data = {
          name: target.type+'-'+(Math.random()*1000 | 0),
          url : target.testURL,
          options: {
            // siege options
            concurrent: $scope.testInfo.concurrency,
            request: $scope.testInfo.numRequest,
            url : target.testURL
          },
          // TODO: connect to results from docker build & run
          cAdvisorUrl: target.host+':8080',
          containerName: target.containerName,
          containerId: target.containerId
        };
        console.log('data:', data)

        $http({
          method: 'POST',
          url:'/testplan',
          data: data
        })
        .success(function(data){
          target.job = data.job;
          console.log(target);
        })
        .error(function(res, status){
          console.log(res,status);
        });

        // $scope.testInfo.progress = 100.0*count / $scope.targets.length;
        // count++;
      },

      function(err, results) {
        done();
      }
    );

    function done() {
      $scope.showTesting = false;
      $scope.showResult = true;

      // TODO: display chart from $scope.jobs
      // - request report data
      // - render charts

    }
  };
})


//camel cased directive name
//Instance target element
.directive('target', function ($parse) {
  var directiveDefinitionObject = {
    restrict: 'E',
    replace: false,
    scope: {data: '=data'},
    link: function (scope, element, attrs) {
      var $el = $(element);
      var data = scope.data;

      $el.append('<h4>'+data.type+'</h4>');
      if (data.type === 'digitalocean') {
        $el.append('<div>'+data.name+'</div>');
        $el.append('<div>'+data.clientId+'</div>');
        $el.append('<div>'+data.region.name+'</div>');
        $el.append('<div>'+data.size.name+'</div>');
        $el.append('<div>'+data.testURL+'</div>');
      } else if (data.type === 'general') {
        $el.append('<div>'+data.host+'</div>');
        $el.append('<div>'+data.port+'</div>');
        $el.append('<div>'+data.testURL+'</div>');
      }
    }
  };
  return directiveDefinitionObject;
})


//camel cased directive name
//in your HTML, this will be named as bars-chart
.directive('barsChart', function ($parse) {
  //explicitly creating a directive definition variable
  //this may look verbose but is good for clarification purposes
  //in real life you'd want to simply return the object {...}
  var directiveDefinitionObject = {
    //We restrict its use to an element
    //as usually  <bars-chart> is semantically
    //more understandable
    restrict: 'E',
    //this is important,
    //we don't want to overwrite our directive declaration
    //in the HTML mark-up
    replace: false,
    //binding its scope to this new data source
    scope: {data: '=chartData'},

    link: function (scope, element, attrs) {
      //converting all data passed thru into an array
      // var data = attrs.chartData.split(',');
      //in D3, any selection[0] contains the group
      //selection[0][0] is the DOM node
      //but we won't need that this time
      var chart = d3.select(element[0]);
      //to our original directive markup bars-chart
      //we add a div with out chart stling and bind each
      //data entry to the chart
      chart.append("div").attr("class", "chart")
        .selectAll('div')
        .data(scope.data).enter().append("div")
        .transition().ease("elastic")
        .style("width", function(d) { return d + "%"; })
        .text(function(d) { return d + "%"; });
      //a little of magic: setting it's width based
      //on the data value (d)
      //and text all with a smooth transition
    }
  };
  return directiveDefinitionObject;
});

