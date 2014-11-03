/**
* TestPlan.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/


var kueUrl = 'http://localhost:3001';
var kue = require('kue');
var jobs = kue.createQueue();

module.exports = {
    createTestPlanJob: function (task, cb){
        var job = jobs.create('bombard', task);
        job.save(function (err){
            if( !err ) {
                cb(job.id, err);
                return;
            }
            throw err;
        });
    }
}; 

