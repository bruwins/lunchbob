var express = require('express')
var app = express();
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/lunchbob');
var Restaurants = require('./app/models/preferences/restaurants');
var querystring = require('querystring')
var request = require('request')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8087;

var router = express.Router();
router.route('/slack')
    .post(function(req, res) {
        console.log("REQ: ", req.body);
        var body = req.body;
        var teamId = body.team_id;
        var channelId = body.channel_id;
        var slackId = "slack_"+teamId+"_"+channelId;
        var message = body.text;
        var trigger = body.trigger_word;
        var command = message.substring(message.indexOf(trigger)+trigger.length);
        command = command.trim();
        Restaurants.findById(slackId,function(err, restaurants) {
            if(err) {
                console.log("ERROR!!!", err);
                sendPost("Sorry! I could not process your command", res);
            }

            //Retrieve restaurant list
            if(!restaurants) {
                var domain = body.team_domain;
                var channelName = body.channel_name;
                restaurants = new Restaurants();
                restaurants._id = slackId;
                restaurants.name = "[" + domain +"-" + channelName + "] Restaurants";
            }
            if(!restaurants.list) {
                restaurants.list = {};
            }

            if(command.indexOf("add") === 0) {
                var restaurantName = command.substring(command.indexOf("add")+("add").length);
                restaurantName = restaurantName.trim();
                if(restaurants.list[restaurantName]) {
                    sendPost("You already have this restaurant in your list!", res);
                    return;
                }
                restaurants.list[restaurantName] = true;
                restaurants.markModified('list');
                savePref(restaurants, "Added " + restaurantName + " to the restaurant list!", res);
            } else if(command.indexOf("remove") === 0) {
                var restaurantName = command.substring(command.indexOf("remove")+("remove").length);
                restaurantName = restaurantName.trim();
                if(restaurantName === "Chipotle") {
                    sendPost("Sorry Rana, Chipotle can never be removed.", res);
                }
                if(!restaurants.list[restaurantName]) {
                    sendPost("You didn't have this restaurant on your list!", rest);
                }
                restaurants.list[restaurantName] = false;
                restaurants.markModified('list');
                savePref(restaurants, "Removed " + restaurantName + " from the restaurant list!",res);
            } else if(command.indexOf("help") === 0) {
                var helpCommands = "add | remove | list | decide";
                sendPost(helpCommands, res);
            }else {
                var currList = restaurants.list;
                var arr = []
                var restList = "";
                for(var rest in currList) {
                    if(currList.hasOwnProperty(rest)) {
                        restList += (rest + "\n");
                        arr.push(rest);
                    }
                }

                console.log("COMMAND ["+ command +"]");
                console.log("index:", command.indexOf("list"));
                if(command.indexOf("list") === 0) {
                    if(restList === "") {
                        restList = "You don't have any restaurants in your list!";
                    }
                    sendPost(restList, res);
                } else if(command.indexOf("decide") === 0) {
                    var decision = getRandomItem(arr);
                    var username = body.user_name;
                    if(username === "rana.akhavan") {
                        sendPost("You should go to Chipotle, Rana.", res);
                        return;
                    }
                    sendPost("You should go to " + decision + ". Did I do well?", res);
                } else {
                    sendPost("Sorry I didn't recognize that command. Try using help to see what I can do.", res);
                }
            }
        });
    });

router.use(function(req, res, next) {
    console.log("in the use flow");
    next();
});

app.use('/api', router);

app.listen(port);
console.log("Lunchbob has arrived");


function sendPost(text, res) {
    var payload = {
        text: text,
        username: "lunchbob"
    };
    var url = 'https://hooks.slack.com/services/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';
    request.post(url, {
        form: {
                  payload: JSON.stringify(payload)
              }
    }, function(err, response) {
        if(err) {
            res.send(err);
            return;
        }
        res.json({message: "Completed!"});
    });
}

function getRandomItem(arr) {
    var max = arr.length;
    return arr[Math.floor(Math.random() * max)];
}

function savePref(pref, message, res) {
    pref.save(function(err) {
        if(err) {
            console.log("ERROR! ", error);
            sendPost("Sorry! I could not process your command", res);
        }
        sendPost(message, res);
    });
}
