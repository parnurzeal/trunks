var kue = require('kue');
var jobs = kue.createQueue();
var _ = require('lodash');
var fs = require('fs');
var sys = require('sys');
var spawn = require('child_process').spawn;
var redis = require('redis'),
    client = redis.createClient();
var request = require('superagent');

var NAMESPACE = 'test:';

var getMetricRedisKey = function (job){
    return NAMESPACE + job.id + ':metrics';
};

var getReportRedisKey = function (job){
    return NAMESPACE + job.id + ':report';
};

var getCombinedMetric = function (job, metrics){
    // extract stats
    var stats = metrics.stats;
    var key = NAMESPACE + job.id + ':stat'
    var targetObj = _.reduce(stats, function (acc, item){
        acc[item.timestamp] = JSON.stringify(item);
        return acc;
    }, {});
    client.hmset(key, targetObj, redis.print);
};

var collectMetrics = function (job, endpoint){
    var key = getMetricRedisKey(job);
     
    request.get(endpoint).end(function (res){
        client.append(key, res.text);
        getCombinedMetric(job, JSON.parse(res.text));
    });
};

var registerMetricsCollector = function (job){
    var endpoint = job.data.cAdvisorEndpoint + '/containers/' + job.data.container;
    return setInterval(function (){
        collectMetrics(job, endpoint);
    }, 1000);
};

var doSiege = function (job, done){    
    var logPath, siege, siegeOptions;
    var intervalHandler = registerMetricsCollector(job);

    try{
        mkdirp('/tmp/siege/log/');
    } catch (e) {
      console.log(e);
    }

    logPath = '/tmp/siege/log/' + job.id;

    siegeOptions = job.data.options.split(' ');
    siegeOptions.push('--log='+logPath);

    if (_.has(job.data, 'urlFile')){
        siegeOptions.push('--file=');
        siegeOptions.push(job.data.urlFile)
    } else {
        siegeOptions.push(job.data.url);
    }
    siege  = spawn('siege', siegeOptions);
    console.log('Bombarding %s, with options %s', job.data.url, siegeOptions);

    siege.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    siege.stderr.on('data', function (data) {
        job.log(data);
    });

    siege.on('exit', function (code) {
        console.log('child process exited with code ' + code);

        // process log
        fs.readFile(logPath, 'utf-8', function (err, data){
            if (err) throw err;
            console.log(data);
            var lines = data.split('\n');
            var headers = _.map(lines[0].split(','), trim),
                vals = _.map(lines[1].split(','), trim);
            var zippedResult = _.zipObject(headers, vals);

            fs.unlink(logPath); 
            // save log to redis
            client.set(getReportRedisKey(job), JSON.stringify(zippedResult));
            clearInterval(intervalHandler);
            done();
        });
    });
}

jobs.process('bombard', doSiege);

function trim(s){
    return s.trim();
}

kue.app.listen(3001);


// Graceful shutdown
process.once( 'SIGTERM', function ( sig ) {
  queue.shutdown(function(err) {
    console.log( 'Kue is shut down.', err||'' );
    process.exit( 0 );
  }, 5000 );
});
