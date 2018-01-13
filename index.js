//node.js deps
var events = require('events');
var inherits = require('util').inherits;

//npm deps

//app deps
var doorThing = require('../aws-iot-door-thing');
const GarageDoor = require('../raspi-garage-door').GarageDoor;

console.log('Creating garage door');
// GarageDoor(Relay, Open, Closed)
var garageDoor = new GarageDoor(21, 20, 16); 

var myDoorThing = new doorThing(); 

myDoorThing.on('delta', function(thing, thingState){
	console.log('got delta in main');
	console.log('received delta in main: ' + thing + JSON.stringify(thingState));
//	var deltaMsg = JSON.parse(state);
	if (thingState.hasOwnProperty("state")) {
		if (thingState.state.hasOwnProperty("doorActivated")) {
			if (thingState.state.doorActivated) {
				console.log('Activating door');
				garageDoor.activateDoor();
				myDoorThing.publishState({
				    "state" : {
				        "reported" : {
				          "doorActivated" : "true"
				        }
			   		}
				});
			} else {
				console.log('door activated is not true');
			}
		} else {
			console.log('no doorActivated property');
		}
	} else {
		console.log('no state property');
	}  
});


garageDoor.on('endActivation', function() {
  emitted = true; 
  myDoorThing.publishState({
    "state" : {
        "desired" : {
          "doorActivated" : "false"
        },
        "reported" : {
          "doorActivated" : "false"
        }
	}
  });
  console.log('door emitted endActivation');
});


garageDoor.on('Open', function() {
  emitted = true; 
  myDoorThing.publishState({
	    "state" : {
	        "reported" : {
	          "status" : "Open"
	        }
   		}
  });
  console.log('door emitted open');
});	


garageDoor.on('InBetween', function() {
  emitted = true; 
  myDoorThing.publishState({
	    "state" : {
	        "reported" : {
	          "status" : "InBetween"
	        }
   		}
  });
  console.log('door emitted InBetween');
});	


garageDoor.on('Closed', function() {
  myDoorThing.publishState({
	    "state" : {
	        "reported" : {
	          "status" : "Closed"
	        }
   		}
  });
  emitted = true; 
  console.log('door emitted closed');
});



// Cause the door ot emit the current state after letting other processes initialize

setTimeout(function() {
	console.log('emitting the current state');
	garageDoor.emitCurrentState();
}, 3000);

process.on('SIGINT', function () {
  garageDoor.cleanup()
});
