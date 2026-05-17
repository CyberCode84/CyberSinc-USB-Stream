var exec = require('cordova/exec');

var CyberSincReceiver = {
    start: function (success, error) {
        exec(success, error, 'CyberSincReceiver', 'start', []);
    },
    stop: function (success, error) {
        exec(success, error, 'CyberSincReceiver', 'stop', []);
    }
};

module.exports = CyberSincReceiver;
