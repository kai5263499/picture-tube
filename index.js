var PNG = require('png-js');
var charm = require('charm');
var x256 = require('x256');
var buffers = require('buffers');
var es = require('event-stream');
var fs = require('fs');

var Stream = require('stream').Stream;

module.exports = function (opts) {
    if (!opts) opts = {};
    if (!opts.cols) opts.cols = 80;
    
    var c = opts.charm ? opts.charm : charm();
    if(!opts.filename) var bufs = buffers();
    
    var paintImage = function (err, bufs) {
        var data = opts.filename ? fs.readFileSync(opts.filename) : buffers(bufs).slice();
        var png = new PNG(data);
        
        png.decode(function (pixels) {
            var dx = png.width / opts.cols;
            var dy = 2 * dx;
            
            for (var y = 0; y < png.height; y += dy) {
                for (var x = 0; x < png.width; x += dx) {
                    var i = (Math.floor(y) * png.width + Math.floor(x)) * 4;
                    
                    var ix = x256([ pixels[i], pixels[i+1], pixels[i+2] ]);
                    if (pixels[i+3] > 0) {
                        c.background(ix).write(' ');
                    }
                    else {
                        c.display('reset').write(' ');
                    }
                }
                c.display('reset').write('\r\n');
            }
            
            if(!opts.filename) c.display('reset').end();
        });
    }
    
    if(opts.filename) {
        paintImage();
    } else {
        var ws = es.writeArray(paintImage);
        return es.duplex(ws, c);
    }
};
