var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs');

//var onoff = require('onoff');

var myData = require("../src/data.json");

const sensor = require('ds18b20-raspi');
//var getFiles = require('./query.js').getFiles,
//    ept = require('./mbsdata.js').MbsData;

var port = parseInt(process.argv[2] || '8081', 10);
if (port < 1000)
   console.log('Operating on Port '+port+' requires priveledge');

app.set('port', port);


// Is this even needed, especially in production ?
//        to server up static explained files ???
var home = path.join(__dirname, '..', 'public');
app.use(express.static(home));

// needed for when a form posts a JSON encoded body
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

setInterval(function() {
   sensor.readSimpleF(2, (err, temp) => {
	  if (err) {
		  console.log(err);
	  } else {
	  console.log(`${temp} degF`);
      }
   });
}, 10000);

// -----------------------------------------------------------------------------
//    TEST
// -----------------------------------------------------------------------------

app.get('/api/hello', function (req, res) {
  var now = new Date();
  res.send('Hello World on '+now);
});

// -----------------------------------------------------------------------------
// Migrated from previous version of MbsNode
// -----------------------------------------------------------------------------

// http://ncsvmmbspreprod.nctr.fda.gov/query/files/05-01-2015/05-11-2015/*/M3
// http://ncsvmmbspreprod.nctr.fda.gov/query/files/05-01-2015/05-11-2015/DIA/M3
/*
app.get('/api/query/files/:fromDate/:toDate/:otb/:subjects', function(req, res){

    var files = getFiles('NCTR', req.params.fromDate, req.params.toDate, req.params.otb, req.params.subjects);
    var names = JSON.stringify( files );
    res.writeHead(200, {'Content-Type': 'application/json', 'Content-Length':names.length});
    res.end(names);
});

app.post('/api/query/endpt/', function(req, res){

    var ids = req.body.endpts;
    if (typeof ids != 'Array')
       ids = ids.split(/[ ,]/);

    var getOneAnswer = function (results) {
      var data = JSON.stringify( results );
      res.writeHead(200, {'Content-Type': 'application/json', 'Content-Length':data.length});
      res.end(data);
    };

    ept.getEndpt(req.body.filename, ids, getOneAnswer);
});*/

app.get('/api/current_temp/', function(req, res) {
  
    var temp = {Temperature: 72.12}
   // round temperature reading to 1 digit
   sensor.readSimpleF(2, (err, temp) => {
	  if (err) {
		  console.log(err);
	  } else {
	  console.log(`${temp} degF`);
      var names = JSON.stringify( temp );
      res.writeHead(200, {'Content-Type': 'application/json', 'Content-Length':names.length});
      res.end(names);
	  }
    });
});

//   var url = `/api/myData/${latitude}/${longitude}/${dooropen}/${doorclose}/${lighton}/${lightoff}/${heaton}/${heatoff}/${fanon}/${fanoff}`;
// localhost:8081//api/myData/34.63416667/-92.31388889/-20/30/0/40/35/45/80/75
//var latitude, longitude, dooropen, doorclose, lighton, lightoff, heaton, heatoff, fanon, fanoff;
app.get('/api/myData/:latitude/:longitude/:dooropen/:doorclose/:lighton/:lightoff/:heaton/:heatoff/:fanon/:fanoff', function(req, res){

var err;
//var isGood;
//var latitude, longitude, dooropen, doorclose, lighton, lightoff, heaton, heatoff, fanon, fanoff;
//console.log('Latitude = ', latitude);
//var latitude = req.params.latitude;
  
     const userData = {
         latitude: parseFloat(req.params.latitude),
         longitude: parseFloat(req.params.longitude),
         dooropenOffset: parseInt(req.params.dooropen),
         doorcloseOffset: parseInt(req.params.doorclose),
         lightonOffset: parseInt(req.params.lighton),
         lightoffOffset: parseInt(req.params.lightoff),
         heatOn: parseInt(req.params.heaton),
         heatOff: parseInt(req.params.heatoff),
         fanOn: parseInt(req.params.fanon),
         fanOff: parseInt(req.params.fanoff)
     }
      
//      console.log('userData = ', userData);
      var data = JSON.stringify( userData, null, '\t' );
      fs.writeFile('../src/data.json', data);
      if (err) throw 'error writing file: ' + err;

      let isGood = 'Good';
      if (err) {
         isGood = err;
         }  

//      console.log('data = ', data);
      res.writeHead(200, {'Content-Type': 'application/json', 'Content-Length':data.length});
      var data = JSON.stringify( {isGood} );
      res.end(data);
});

 

