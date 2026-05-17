var app = {
    isReceiving: false,
    statsInterval: null,

    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        console.log('CyberSinc RX Console: Online');
        this.setupButtons();
    },

    setupButtons: function() {
        var btn = document.getElementById('btn-reception');
        btn.addEventListener('click', this.toggleReception.bind(this));

        var btnExit = document.getElementById('btn-exit');
        btnExit.addEventListener('click', this.stopReception.bind(this));

        // Keyboard support for remote
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                if (!this.isReceiving) this.startReception();
            }
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (this.isReceiving) this.stopReception();
            }
        });
    },

    toggleReception: function() {
        if (this.isReceiving) {
            this.stopReception();
        } else {
            this.startReception();
        }
    },

    startReception: function() {
        var self = this;
        this.updateUI('connecting');

        if (window.CyberSincReceiver) {
            window.CyberSincReceiver.start(function(msg) {
                self.isReceiving = true;
                self.updateUI('active');
                self.startStats();
            }, function(err) {
                self.updateUI('error', err);
            });
        } else {
            // Mock preview mode
            setTimeout(function() {
                self.isReceiving = true;
                self.updateUI('active');
                self.startStats();
            }, 1000);
        }
    },

    stopReception: function() {
        var self = this;
        this.isReceiving = false;
        this.stopStats();

        if (window.CyberSincReceiver) {
            window.CyberSincReceiver.stop(function() {
                self.updateUI('idle');
            }, function(err) {
                console.error(err);
                self.updateUI('idle');
            });
        } else {
            this.updateUI('idle');
        }
    },

    startStats: function() {
        var self = this;
        this.statsInterval = setInterval(function() {
            var br = (Math.random() * (1.1 - 0.7) + 0.7).toFixed(2);
            var lat = Math.floor(Math.random() * (10 - 4) + 4);
            
            document.getElementById('stat-bitrate').innerText = br + ' MB/s';
            document.getElementById('stat-fps').innerText = '60 FPS';
            document.getElementById('stat-latency').innerText = lat + ' MS';
            
            var liveLat = document.getElementById('live-latency');
            if (liveLat) liveLat.innerText = 'LATENCY: ' + lat + 'MS';
            
            // Neon pulse on stats
            document.getElementById('stat-bitrate').classList.add('text-cyan-400');
            document.getElementById('stat-fps').classList.add('text-cyan-400');
            document.getElementById('stat-latency').classList.add('text-cyan-400');
        }, 800);
    },

    stopStats: function() {
        if (this.statsInterval) clearInterval(this.statsInterval);
        document.getElementById('stat-bitrate').innerText = '0.0 MB/s';
        document.getElementById('stat-fps').innerText = '0 FPS';
        document.getElementById('stat-latency').innerText = '-- MS';
        
        document.getElementById('stat-bitrate').classList.remove('text-cyan-400');
        document.getElementById('stat-fps').classList.remove('text-cyan-400');
        document.getElementById('stat-latency').classList.remove('text-cyan-400');
    },

    updateUI: function(state) {
        var btn = document.getElementById('btn-reception');
        var btnText = document.getElementById('btn-text');
        var statusLabel = document.getElementById('status-label');
        var statusDot = document.getElementById('status-dot');
        var statusDesc = document.getElementById('status-desc');
        var stage = document.getElementById('video-stage');

        if (state === 'active') {
            stage.classList.remove('hidden');
            stage.classList.add('flex');
            
            statusLabel.innerText = 'RECEIVING STREAM';
            statusLabel.className = 'font-mono text-xs font-bold tracking-widest text-green-500 uppercase';
            statusDot.className = 'w-3 h-3 rounded-full bg-green-500 ring-8 ring-green-500/20 animate-pulse';
            statusDesc.innerText = 'Decoder Ativo: H.264 High-Profile // 60.00 FPS';
        } else if (state === 'connecting') {
            statusLabel.innerText = 'HANDSHAKING...';
            statusLabel.className = 'font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase';
        } else {
            // Idle
            stage.classList.add('hidden');
            stage.classList.remove('flex');
            
            statusLabel.innerText = 'OFFLINE';
            statusLabel.className = 'font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase';
            statusDot.className = 'w-3 h-3 rounded-full bg-zinc-700 ring-8 ring-zinc-700/10';
            statusDesc.innerText = 'Aguardando handshake AOA no barramento USB secundário...';
        }
    }
};

app.initialize();

