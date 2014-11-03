/**
 * TestPlanController
 *
 */
var _ = require('lodash');
module.exports = {

    /**
     * `TestPlanController.index()`
     */
    index: function (req, res) {
        return res.view({name: 'fhello'});
    },

    /**
     * `TestPlanController.create()`
     */
    create: function (req, res) {
        if (req.method == "POST"){
            var name = req.param('name');
            var options = req.param('options');
            var url = req.param('url');
            TestPlanService.createTestPlanJob({ name: name,
               options: options,
               url: url,
               container: 'docker/nginx',
               cAdvisorEndpoint: 'http://192.168.59.103:8080/api/v1.2'
               },
               function (job, err){
                   res.json({job: job, err: err});
               });
        } else {
            return res.view({name: ''});
        }
    },

    /**
     * `TestPlanController.execute()`
     */
    execute: function (req, res) {
        return res.json({
            todo: 'execute() is not implemented yet!'
        });
    },

    find: function (req, res){
        var testid = req.param.id;
        client.get('test:' + testid, function (err, data){
            if (err){
                throw err;
            }
            res.json(data);
        });
    },

    chart: function (req, res){
        TestPlanService.getContainerMetrics(req.params.id, function (err, data){
            // data is hash

            var sortedKey = _.keys(data).sort();
            
            var chartData = _.map(sortedKey, function (item){
                return JSON.parse(data[item]);
            });
            
            res.view('testplan/chart', {data: JSON.stringify(chartData), layout:null});
        });
    },

    chartData: function (req, res){
        TestPlanService.getContainerMetrics(req.params.id, function (err, data){

            var sortedKey = _.keys(data).sort();
            
            var chartData = _.map(sortedKey, function (item){
                return JSON.parse(data[item]);
            });
            res.json(chartData);
        }); 
    },

    // api endpoint

    getJobStatus: function (req, res){
        TestPlanService.getTestJobStatus(req.params.id, function (err, job){
            if (err){
                res.json({ message: 'error occured', err: JSON.stringify(err)});
                return;
            }

            res.json(job);
        });
    },

    getJobReport: function (req, res){
        TestPlanService.getTestResult(req.params.id, function (err, job){
            if (err){
                res.json({ message: 'error occured', err: JSON.stringify(err)});
                return;
            }

            res.json(job);
        });
    },
    createNewJob: function (req, res){
        TestPlanService.createTestPlanJob({ name: 'New Jobx',
                                            concurrent: 20,
                                            time: '30s',
                                            url: 'http://192.168.59.103/',
                                            container: 'docker/nginx',
                                            cAdvisorEndpoint: 'http://192.168.59.103:8080/api/v1.2'
                                          },
               function (job, err){
                   res.json({message: 'job created with id: '+ job.id});
               });
    },

    
    chartData2: function (req, res){
        TestPlanService.getContainerMetrics(req.params.id, function (err, data){
            var sortedKey = _.keys(data).sort();            
            var chartData = _.map(sortedKey, function (item){
                return JSON.parse(data[item]);
            });
            var lenChart = chartData.length;
            var cur = chartData[lenChart-1];
            var prev = chartData[lenChart-2];
            console.log(lenChart);
            var intervalInNs = getInterval(cur.timestamp, prev.timestamp);
            res.json({cpu: (cur.cpu.usage.total - prev.cpu.usage.total) / intervalInNs});
        }); 
    },
};

// Gets the length of the interval in nanoseconds.
function getInterval(current, previous) {
  var cur = new Date(current);
  var prev = new Date(previous);

  // ms -> ns.
  return (cur.getTime() - prev.getTime()) * 1000000;
 }
