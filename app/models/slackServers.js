var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SlackServerSchema  = new Schema({
    _id: String,
    name: String,
    url: String
});

module.exports = mongoose.model('SlackServers', SlackServerSchema);
