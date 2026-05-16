var exec = require('cordova/exec');

var CyberSinc = {
    start: function(success, error) {
        exec(success, error, 'CyberSinc', 'startStreaming', []);
    },
    stop: function(success, error) {
        exec(success, error, 'CyberSinc', 'stopStreaming', []);
    }
};

module.exports = CyberSinc;
