var app = {
    isStreaming: false,

    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        console.log('CyberSinc Initialized');
        this.setupButtons();
    },

    setupButtons: function() {
        var btn = document.getElementById('btn-toggle');
        btn.addEventListener('click', this.toggleStreaming.bind(this));
    },

    toggleStreaming: function() {
        if (this.isStreaming) {
            this.stopStreaming();
        } else {
            this.startStreaming();
        }
    },

    startStreaming: function() {
        var self = this;
        this.updateUI('connecting');

        if (window.CyberSinc) {
            window.CyberSinc.start(function(msg) {
                console.log(msg);
                self.isStreaming = true;
                self.updateUI('streaming');
            }, function(err) {
                console.error(err);
                self.updateUI('error', err);
            });
        } else {
            // Mock para visualização no navegador/AI Studio
            setTimeout(function() {
                self.isStreaming = true;
                self.updateUI('streaming');
            }, 1000);
        }
    },

    stopStreaming: function() {
        var self = this;
        if (window.CyberSinc) {
            window.CyberSinc.stop(function() {
                self.isStreaming = false;
                self.updateUI('idle');
            }, function(err) {
                console.error(err);
                self.updateUI('idle');
            });
        } else {
            this.isStreaming = false;
            this.updateUI('idle');
        }
    },

    updateUI: function(status, errorMsg) {
        var btn = document.getElementById('btn-toggle');
        var btnText = document.getElementById('btn-text');
        var btnIcon = document.getElementById('btn-icon');
        var statusDot = document.getElementById('status-dot');
        var statusLabel = document.getElementById('status-label');
        var statusRings = document.getElementById('status-rings');
        var systemMsg = document.getElementById('system-msg');

        if (status === 'streaming') {
            btn.classList.remove('border-cyan-500', 'text-cyan-400');
            btn.classList.add('border-red-600', 'text-red-500');
            btnText.innerText = 'PARAR TRANSMISSÃO';
            btnIcon.classList.add('bg-red-500/10');
            btnIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
            
            statusDot.className = 'w-2 h-2 rounded-full ring-4 bg-green-500 ring-green-500/20 animate-pulse';
            statusLabel.innerText = 'BROADCASTING 60FPS';
            statusLabel.className = 'text-[10px] px-4 py-1.5 rounded-full font-black uppercase bg-green-500/10 text-green-500';
            statusRings.classList.remove('hidden');
            systemMsg.innerText = 'Injetando H.264 direto no Barramento USB...';
        } else if (status === 'connecting') {
            statusLabel.innerText = 'SYNCING...';
            statusLabel.className = 'text-[10px] px-4 py-1.5 rounded-full font-black uppercase bg-cyan-500/10 text-cyan-500';
        } else if (status === 'error') {
            statusLabel.innerText = 'CRITICAL ERROR';
            statusLabel.className = 'text-[10px] px-4 py-1.5 rounded-full font-black uppercase bg-red-500/10 text-red-500';
            systemMsg.innerText = errorMsg || 'Erro na conexão AOA.';
        } else {
            // Idle
            btn.classList.add('border-cyan-500', 'text-cyan-400');
            btn.classList.remove('border-red-600', 'text-red-500');
            btnText.innerText = 'INICIAR ESPELHAMENTO';
            btnIcon.classList.remove('bg-red-500/10');
            btnIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>';

            statusDot.className = 'w-2 h-2 rounded-full ring-4 bg-zinc-700 ring-zinc-700/10';
            statusLabel.innerText = 'READY';
            statusLabel.className = 'text-[10px] px-4 py-1.5 rounded-full font-black uppercase bg-zinc-800 text-zinc-400';
            statusRings.classList.add('hidden');
            systemMsg.innerText = 'Aguardando conexão AOA no receptor...';
        }
    }
};

app.initialize();
