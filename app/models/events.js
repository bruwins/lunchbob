var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EventSchema  = new Schema({
    _id: String,
    time: Date,
    username: String,
    command: String
});

module.exports = mongoose.model('Events', EventSchema);
