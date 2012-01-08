
/**
 * Module dependencies.
 */

var express = require('express')
  , sio = require('socket.io')
  , routes = require('./routes')
  , sc = require('sc4node')
  , child_process = require('child_process')
  , path = require('path')
  , crypto = require('crypto')
  , util = require('util')
  , fs = require('fs')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", 
  app.address().port, app.settings.env);

var audioDir = path.join(process.cwd(), 'public', 'audio');
if (!path.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

var MAX_RECORDING_SEC = 30;
var SC_SEVER_STARTED_MSG = 'notification is on';
var SC_SEVER_START_ERR_MSG = 'server failed to start';

// Socket IO
var io = sio.listen(app);
io.sockets.on('connection', function(socket) {
  util.debug('connection');
    
  var curFile;
  var generatedFiles = new Array();
  var sclang;
  var handler = function(data) {
    util.debug('sclang stdout: ' + data);
    var msg = '' + data;
    if (msg.indexOf(SC_SEVER_STARTED_MSG) != -1) {
      socket.emit('scserverstated');
    } else if (msg.indexOf(SC_SEVER_START_ERR_MSG) != -1) {
    }
    socket.emit('stdout', msg);
  };
  socket.emit('scserverstarting');
  sclang = createSclang(handler, generatedFiles);
  var timeoutId;
  var intervalId;
  
  socket.on('generate', function(msg) {
    util.debug('generate: ' + msg);

    var aiffFile;
    do {
      curFile = randomString();
      aiffFile = path.join(audioDir, curFile + '.aiff');
      util.debug('aiffFile: ' + aiffFile);
    } while (path.existsSync(aiffFile));
    //generatedFiles.push(path.join(audioDir, curFile + '.*'));
    sclang.evaluate(
      's.waitForBoot(s.prepareForRecord(\'' 
      + aiffFile + '\');s.record;' 
      + msg + '\n);', false);

    var timeRemaining = MAX_RECORDING_SEC + 1;
    timeoutId = setTimeout(function() {
      timeoutId = stopRecording(sclang, socket, audioDir, curFile);
    }, timeRemaining * 1000);

    var timeRecorded = 0;
    util.debug('timerecorded: ' + timeRecorded);
    socket.emit('timerecorded', '' + timeRecorded);
    intervalId = setInterval(function() {
      timeRecorded++;
      util.debug('timerecorded: ' + timeRecorded);
      socket.emit('timerecorded', '' + timeRecorded);
      if (timeRecorded == MAX_RECORDING_SEC) clearInterval(intervalId);
    }, 1000);
  });
    
  socket.on('stop', function() {
    util.debug('stop');
    if (timeoutId) clearTimeout(timeoutId);
    if (intervalId) clearInterval(intervalId);
    timeoutId = stopRecording(sclang, socket, audioDir, curFile);
  });

  socket.on('disconnect', function() {
    util.debug('disconnect');
    if (timeoutId) clearTimeout(timeoutId);
    if (intervalId) clearInterval(intervalId);
    
    sclang.dispose();
    
    for (i in generatedFiles) {
      rmFile(generatedFiles[i]);
    }
  });
});

function createSclang(handler, generatedFiles) {
  var sclang = new sc.Sclang('/usr/bin/', handler);
  sclang.evaluate('Server.default = Server.internal;s = Server.default;s.boot;');

  // FIXME workaround.
  var workaroundTmpFile;
  do {
    workaroundTmpFile = '/tmp/nrt-sc140-' + randomString() + '.aiff';
  } while (path.existsSync(workaroundTmpFile));
  generatedFiles.push(workaroundTmpFile);
  sclang.evaluate(
    's.waitForBoot(s.prepareForRecord(\'' 
    + workaroundTmpFile
    + '\');s.record;s.stopRecording;);', 
    false);
  return sclang;
}

function randomString() {
  var buf = crypto.randomBytes(4);
  var rand = '';
  for (var i = 0, len = buf.length; i < len; i++) {
    rand = rand + buf[i];
  }
  return rand;
}

function stopRecording(sclang, socket, audioDir, filename) {
  sclang.evaluate('s.stopRecording;', false);
  sclang.stopSound();
  var timeoutId = setTimeout(function() {
    var aiffFile = path.join(audioDir, filename + '.aiff');
    var mp3File = path.join(audioDir, filename + '.mp3');
    convert(aiffFile, mp3File, function(error, stdout, stderr) {
      util.debug('stdout: ' + stdout);
      util.debug('stderr: ' + stderr);
      if (error != null) {
        util.debug('exec error: ' + error);
      }
      socket.emit('filegenerated', filename);
    });
  }, 1000);
  return timeoutId;
}

function convert(aiffFile, mp3File, callback) {
  child_process.exec(
    'ffmpeg -i ' + aiffFile + ' -f mp3 -acodec libmp3lame -ab 192000 -ar 44100 ' 
    + mp3File, 
    callback);
}

function rmFile(file) {
  child_process.exec('rm -f ' + file, function(error, stdout, stderr) {
    util.debug('stdout: ' + stdout);
    util.debug('stderr: ' + stderr);
    if (error != null) {
      util.debug('exec error: ' + error);
    }
  });
}
