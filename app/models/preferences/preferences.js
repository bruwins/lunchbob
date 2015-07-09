var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PreferenceSchema  = new Schema({
    _id: String,
    name: String
});

module.exports = mongoose.model('Preference', PreferenceSchema);
module.exports.PreferenceSchema = PreferenceSchema
