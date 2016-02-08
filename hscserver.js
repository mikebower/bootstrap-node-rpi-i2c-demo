// HSC Pressure Sensor Test program
var i2c = require('i2c-bus');
console.log("Opening i2c1");
var i2c1 = i2c.openSync(1);
var HSC_ADDR = 0x28;
var fs = require('fs');

setInterval(updateXml, 3000);

//console.log("Closing");
//i2c1.closeSync();

function updateXml(){
    var buf = new Buffer(4);
    var pressure;
    var temperature;
    console.log("Reading...");
    i2c1.i2cReadSync(HSC_ADDR, 4, buf);
    praw = (buf[0] & 0x3F) * 256 + buf[1];    
    traw = (((buf[2] * 256) + (buf[3] & 0x07)) >> 5);
    //console.log("praw = " + praw);
    //console.log("traw = " + traw);
    pressure = convertP(praw);
    temperature = convertT(traw);
    // Create XML file and write to disk
    var xml = 
      "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n" + 
      "<test>\n" +
      "<sample>New Sample</sample>\n" +
      "<pressure>" + pressure.toPrecision(3) + "</pressure>\n" +
      "<temperature>" + temperature.toPrecision(3) + "</temperature>\n" +
      "</test>";

    fs.writeFile(__dirname + '/example.xml', xml);
    console.log("New xml:" + xml);
}

// Convert from raw reading to calibrated reading 
// Ref: http://sensing.honeywell.com/index.php%3Fci_id%3D45841
function convertP(p)
{
  var OUTPUT_MIN = 1638;   // counts
  var OUTPUT_MAX = 14745;  // counts
  var PRESSURE_MAX = 1;    // inHg
  var PRESSURE_MIN = -1;   // inHg

  var PRESSURE_DIFF = PRESSURE_MAX - PRESSURE_MIN; // inHg
  var OUTPUT_DIFF   = OUTPUT_MAX - OUTPUT_MIN; // counts
  return ((p - OUTPUT_MIN) * PRESSURE_DIFF / OUTPUT_DIFF) + PRESSURE_MIN;
}

// Convert from raw reading to calibrated reading 
// Ref: http://sensing.honeywell.com/index.php%3Fci_id%3D45841
function convertT(t)
{
  return ((t / 2047) * 200) - 50;
}
