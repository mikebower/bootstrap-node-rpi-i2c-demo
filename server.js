// Server components for Raspberry Pi Device
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var PORT = 8000;

// JSON parser and file IO
var parser = new require('xml2json');
var fs = require('fs');

   
// Start Listening for HTTP requests 
app.listen(PORT);
console.log('server listening on port ' + PORT);

// Event called after the HTTP Server is created
// on server started we can load client.html page
function handler(req, res){
  fs.readFile(__dirname + '/client.html', function(err, data){
    if (err) {
      console.log(err);
      res.writeHead(500);
      return res.end('Error loading client.html');
    }
    console.log("Writing: " + data);
    res.writeHead(200);
    res.end(data);
  });
}

// Create new websocket to keep content updated without any ajax request
io.sockets.on('connection', function (socket) {
  console.log("Watching for changes on " + __dirname + "/example.xml");
  // Watch xml file for changes
  fs.watchFile(__dirname + '/example.xml', function(curr, prev){
    // On file change read in the new xml
    console.log("Change detected");
    fs.readFile(__dirname + '/example.xml', function(err, data) {
      if (err) throw(err);
      var json = parser.toJson(data);
      console.log("Sending: " + data);
      // send the new data to the client
      socket.volatile.emit('notification', json);
    });
  });
});
