var express = require('express')
var app = express();
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/lunchbob');
var Restaurants = require('./app/models/preferences/restaurants');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8081;

var router = express.Router();
router.route('/slack')
    .post(function(req, res) {
        console.log("REQ: ", req.body);
        var body = req.body;
        var teamId = body.team_id;
        var channelId = body.channel_id;
        var slackId = "slack_"+teamId+"_"+channelId;
        Restaurants.findById(slackId,function(err, restaurants) {
            if(err) {
                console.log("ERROR!!!", err);
                res.send(err);
            }
            if(restaurants) {
                console.log("FOUND RESTAURANTS: ", restaurants);
            } else {
                var domain = body.team_domain;
                var channelName = body.channel_name;
                restaurants = new Restaurants();
                restaurants._id = slackId;
                restaurants.name = domain +"'s " + channelName + " channel";
                console.log("CREATING RESTAURANTS: ", restaurants);
                restaurants.save(function(err) {
                    if(err) {
                        res.send(err);
                    }
                    res.json({message: "Saved new Restaurant list"})
                });
            }
        });
    });

router.use(function(req, res, next) {
    console.log("in the use flow");
    next();
});

app.use('/api', router);

app.listen(port);
console.log('Everythings working!!!', port);
