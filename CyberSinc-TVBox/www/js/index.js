var app = {
    isReceiving: false,

    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        console.log('CyberSinc Receiver Standing By');
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        var btn = document.getElementById('btn-reception');
        btn.addEventListener('click', this.toggleReception.bind(this));

        var btnExit = document.getElementById('btn-exit-fullscreen');
        btnExit.addEventListener('click', this.closeFullscreen.bind(this));

        // Keyboard navigation for TV Box
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                if (!this.isReceiving) this.toggleReception();
            }
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (this.isReceiving) this.closeFullscreen();
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

        // Logic check for USB accessory
        if (window.CyberSincReceiver) {
            window.CyberSincReceiver.start(function(msg) {
                self.isReceiving = true;
                self.updateUI('active');
                self.goFullscreen();
            }, function(err) {
                self.updateUI('error', err);
            });
        } else {
            // Mock preview
            setTimeout(function() {
                self.isReceiving = true;
                self.updateUI('active');
                self.simulateStats();
                self.goFullscreen();
            }, 1500);
        }
    },

    stopReception: function() {
        this.isReceiving = false;
        this.updateUI('idle');
        this.closeFullscreen();
    },

    goFullscreen: function() {
        var videoStage = document.getElementById('video-stage');
        videoStage.classList.remove('hidden');
        videoStage.classList.add('flex');
    },

    closeFullscreen: function() {
        var videoStage = document.getElementById('video-stage');
        videoStage.classList.add('hidden');
        videoStage.classList.remove('flex');
        if (this.isReceiving) this.stopReception();
    },

    updateUI: function(state, errorMsg) {
        var btn = document.getElementById('btn-reception');
        var btnText = document.getElementById('btn-text');
        var statusLabel = document.getElementById('status-label');
        var statusDot = document.getElementById('status-dot');
        var iconPlay = document.getElementById('icon-play');

        if (state === 'active') {
            btn.classList.remove('bg-cyan-500', 'hover:bg-cyan-400');
            btn.classList.add('bg-red-600', 'hover:bg-red-500');
            btnText.innerText = 'PARAR RECEPÇÃO';
            iconPlay.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // Pause icon
            
            statusLabel.innerText = 'RECEBENDO FLUXO 60FPS';
            statusLabel.className = 'text-xs px-6 py-2 rounded-full font-black uppercase bg-green-500/10 text-green-500';
            statusDot.className = 'w-3 h-3 rounded-full ring-8 bg-green-500 ring-green-500/20 animate-pulse';
        } else if (state === 'connecting') {
            statusLabel.innerText = 'SYNCING USB...';
            statusLabel.className = 'text-xs px-6 py-2 rounded-full font-black uppercase bg-cyan-500/10 text-cyan-500';
        } else if (state === 'error') {
            statusLabel.innerText = 'ERROR: ' + (errorMsg || 'CABLE DISCONNECTED');
            statusLabel.className = 'text-xs px-6 py-2 rounded-full font-black uppercase bg-red-500/10 text-red-500';
            statusDot.className = 'w-3 h-3 rounded-full ring-8 bg-red-500 ring-red-500/10';
        } else {
            // Idle
            btn.classList.add('bg-cyan-500', 'hover:bg-cyan-400');
            btn.classList.remove('bg-red-600', 'hover:bg-red-500');
            btnText.innerText = 'INICIAR RECEPÇÃO';
            iconPlay.innerHTML = '<path d="M5 3l14 9-14 9V3z"/>';
            
            statusLabel.innerText = 'OFFLINE';
            statusLabel.className = 'text-xs px-6 py-2 rounded-full font-black uppercase bg-zinc-800 text-zinc-500';
            statusDot.className = 'w-3 h-3 rounded-full ring-8 bg-zinc-700 ring-zinc-700/10';
            
            // Reset stats
            document.getElementById('stat-bitrate').innerText = '0.0 MB/s';
            document.getElementById('stat-fps').innerText = '0 FPS';
            document.getElementById('stat-latency').innerText = '-- MS';
        }
    },

    simulateStats: function() {
        if (!this.isReceiving) return;
        
        var bitrate = (Math.random() * (1.2 - 0.8) + 0.8).toFixed(1);
        var latency = Math.floor(Math.random() * (12 - 4) + 4);
        
        document.getElementById('stat-bitrate').innerText = bitrate + ' MB/s';
        document.getElementById('stat-fps').innerText = '60 FPS';
        document.getElementById('stat-latency').innerText = latency + ' MS';
        
        setTimeout(this.simulateStats.bind(this), 1000);
    }
};

app.initialize();
