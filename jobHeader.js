var mongoose = require('mongoose');
var moment   = require('moment');

var Schema = mongoose.Schema;

var jobHeaderSchema = new Schema({
	Production_Batch                     : { type: String, required: true, unique: true },
	Print_Batch                          : {type: String, default: null},
	Collection_Point                     : {type: String, default: null},
	Collection_Point_Ref                 : {type: String, default: null},
	created_at                           : {type: String, default: moment(new Date()).format('YYYY-MM-DD')},
	updated_at                           : {type: String, default: moment(new Date()).format('YYYY-MM-DD')}
},{ collection: 'JobHeader'})

module.exports = mongoose.model('JobHeader', jobHeaderSchema);