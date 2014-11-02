/**
 * TestPlanController
 *
 */
var kue = require('kue');
var jobs = kue.createQueue();

var createTestPlanJob = function (task, cb){
    var job = jobs.create('bombard', task);

    job.save(function (err){
        if( !err ) {
            cb(job.id, err);
            return;
        }
        console.log(" Error ", err);        
    });
};

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
            createTestPlanJob({ name: name,
                                options: options,
                                url: url,
                                container: 'docker/nginx',
                                cAdvisorEndpoint: 'http://192.168.59.103:8080/api/v1.2' 
                              },
                              function (result, err){
                                  res.view('testplan/createCompleted', {result: result, err: err});
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
    }
};

