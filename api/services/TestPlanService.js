var _ = require('lodash');
var redisConf = sails.config.connections.mainRedis;
var redis = require('redis'),
    client = redis.createClient(redisConf.port, redisConf.host);

var kue  = require('kue'),
    jobs = kue.createQueue({redis: {
        port: redisConf.port,
        host: redisConf.host
    }});

var convertTestParamsToSiege = function (params) {
    var siegeParam = [];
    if (_.has(params, 'concurrent') && !_.isEmpty(params, 'concurrent')){
        siegeParam.push('--concurrent='+params.concurrent);
    }

    if (_.has(params, 'request') && !_.isEmpty(params, 'request')){
        siegeParam.push('--request=' + params.request);
    }

    if (_.has(params, 'time') &&  !_.isEmpty(params, 'time')){
        siegeParam.push('--time='+params.time);
    }

    if (_.has(params, 'urlFile') && !_.isEmpty(params, 'urlFile')){
        siegeParam.push('--u='+params.urlFile);
    }

    if (_.has(params, 'url') && !_.isEmpty(params, 'url')){
        siegeParam.push(params.url);
    }

    return siegeParam.join(' ');
};


module.exports = {
    createTestPlanJob: function (task, cb){
        task.options = convertTestParamsToSiege(task);
        console.log(task);
        var job = jobs.create('bombard', task);
        job.save(function (err){
            if( !err ) {
                cb(job, err);
                return;
            }
            throw err;
        });
    },

    getContainerMetrics: function (testId, cb){
        client.hgetall('test:' + testId + ':stat', cb);
    },

    getTestResult: function (testId, cb){
        client.get('test:'+testId+':report', function (err, data){
            cb(err, JSON.parse(data));
        });
    },

    getTestJobStatus: function (jobId, cb){
        kue.Job.get(jobId, cb);
    },
};
