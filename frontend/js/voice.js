// js/voice.js

window.Voice = {
    recognition: null,
    isListening: false,

    isSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    },

    getLanguageCode(lang) {
        const map = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'mr': 'mr-IN'
        };
        return map[lang] || 'en-IN';
    },

    start(langCode, onResultCallback) {
        if (!this.isSupported()) {
            if(window.Utils) window.Utils.showToast('Voice recognition not supported in this browser.', 'error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.lang = this.getLanguageCode(langCode || (window.I18n ? window.I18n.getCurrentLanguage() : 'en'));
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
            this.isListening = true;
            document.body.classList.add('voice-listening');
            // Dispatch event for UI updates
            window.dispatchEvent(new Event('voiceStart'));
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onResultCallback) onResultCallback(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if(window.Utils) window.Utils.showToast('Voice recognition error: ' + event.error, 'error');
            this.stop();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            document.body.classList.remove('voice-listening');
            window.dispatchEvent(new Event('voiceEnd'));
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error(e);
        }
    },

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
};
