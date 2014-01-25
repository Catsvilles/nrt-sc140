nrt-sc140
=========
[![Build Status](https://travis-ci.org/kn1kn1/nrt-sc140.png?branch=master)](https://travis-ci.org/kn1kn1/nrt-sc140)
[![NPM version](https://badge.fury.io/js/nrt-sc140.png)](http://badge.fury.io/js/nrt-sc140)

non-realtime sc140 sound file generatior web application

System Requirements
-------------------
### Server Side
  - Linux
    - lowlatency or realtime kernel is required.
  - SuperCollider 3.5.x or greater
    - jackd is need to be configured properly.
  - node.js
    - express
    - jade
    - socket.io
    - sc4node
  - ffmpeg and libavformat-extra-XX

### Client Side
Web browser which supports WebSocket

  - Safari
  - Chrome
  - Firefox

Usage
-----
### Server Side
```
% cd nrt-sc140
% node app.js 
```

### Client Side
Access "http:[server address]:3000/" by web browser.

Configuration File
-------------------
### config.json
  - "sclang_path": path to parent folder of sclang. [default: "/usr/local/bin/"]

License
-------
(The MIT License)

Copyright (c) 2012 Kenichi Kanai

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
