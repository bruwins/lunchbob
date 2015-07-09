var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Preference = require('./preferences');
var Schema = mongoose.Schema;

var Restaurants = Preference.PreferenceSchema.extend({
    list: {}
});

module.exports = mongoose.model('Restaurants', Restaurants);
