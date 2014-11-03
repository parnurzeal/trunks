'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'ng-views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', function($scope,digitaloceanAPIservice) {

  $scope.targets = [];

  $scope.concurrencyList = _.range(1, 50)

  $scope.requestNumList = [ 1, 10, 50, 100, 500, 1000, 5000, 10000, 50000 ];

  // test chart data
  $scope.myData = [10,20,30,40,60];

  $scope.showResult = false;

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


  $scope.addDigitalOceanInstance = function() {
    // build image
    var instance = {
      type: 'digitalocean',
      name: $scope.doForm.name,
      clientId: $scope.doForm.clientId,
      clientSecret: $scope.doForm.clientSecret,
      region: $scope.doForm.region,
      size: $scope.doForm.size,
      // dockerfile: submit file to api
      testURL: $scope.doForm.testURL
    };

    // callback after build api finished
    done();

    function done() {
      $scope.targets.push(instance);
      $scope.doForm = {};
    }
  };

  $scope.addGeneralDockerInstance = function() {
    // build image
    var instance = {
      type: 'general',
      host: $scope.gdForm.host,
      // dockerfile: submit file to api
      testURL: $scope.gdForm.testURL,
    };

    // callback after build api finished
    done();

    function done() {
      $scope.targets.push(instance);
    }
  };


  $scope.runTest = function() {

    // callback after build api finished
    done();

    function done() {
      $scope.showResult = true;
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

      $el.append('<div><strong>'+data.type+'</strong></div>');
      if (data.type === 'digitalocean') {
        $el.append('<div>'+data.name+'</div>');
        $el.append('<div>'+data.clientId+'</div>');
        $el.append('<div>'+data.region.name+'</div>');
        $el.append('<div>'+data.size.name+'</div>');
        $el.append('<div>'+data.testURL+'</div>');
      } else if (data.type === 'general') {
        $el.append('<div>'+data.host+'</div>');
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

