// js/voice.js - Production-Ready Farmer Voice Recognition Module

(function() {
    'use strict';

    const Voice = {
        recognition: null,
        state: 'idle', // 'idle' | 'listening' | 'processing' | 'error' | 'permission_denied' | 'unsupported'
        isListening: false,
        activeLang: 'en-IN',

        isSupported() {
            if (typeof window === 'undefined') return false;
            return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
        },

        getLanguageCode(lang) {
            const map = {
                'en': 'en-IN',
                'hi': 'hi-IN',
                'mr': 'mr-IN'
            };
            return map[lang] || 'en-IN';
        },

        getState() {
            return this.state;
        },

        setState(newState, meta = {}) {
            this.state = newState;
            this.isListening = (newState === 'listening');
            
            if (typeof document !== 'undefined' && document.body) {
                if (newState === 'listening') {
                    document.body.classList.add('voice-listening');
                } else {
                    document.body.classList.remove('voice-listening');
                }
            }

            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                const event = new CustomEvent('voiceStateChange', {
                    detail: {
                        state: newState,
                        isListening: this.isListening,
                        ...meta
                    }
                });
                window.dispatchEvent(event);

                if (newState === 'listening') window.dispatchEvent(new Event('voiceStart'));
                if (newState === 'idle' || newState === 'error' || newState === 'permission_denied') {
                    window.dispatchEvent(new Event('voiceEnd'));
                }
            }
        },

        getLocalizedMessage(type, lang) {
            const currentLang = lang || (window.I18n ? window.I18n.getCurrentLanguage() : 'en');
            const messages = {
                unsupported: {
                    en: 'Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your message.',
                    mr: 'या ब्राउझरमध्ये व्हॉइस ओळख उपलब्ध नाही. कृपया Google Chrome किंवा Edge वापरा किंवा मजकूर टाईप करा.',
                    hi: 'इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया Google Chrome या Edge का उपयोग करें या लिखकर पूछें।'
                },
                denied: {
                    en: 'Microphone permission was denied. Please allow microphone access in your browser site settings.',
                    mr: 'मायक्रोफोन परवानगी नाकारली गेली आहे. कृपया ब्राउझर सेटिंग्जमध्ये मायक्रोफोन चालू करा.',
                    hi: 'माइक्रोफ़ोन की अनुमति अस्वीकृत कर दी गई है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
                },
                no_speech: {
                    en: 'No speech was detected. Please tap the microphone and speak near your device.',
                    mr: 'कोणताही आवाज ऐकू आला नाही. कृपया माइक टॅप करून पुन्हा स्पष्ट बोला.',
                    hi: 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर फिर से स्पष्ट बोलें।'
                },
                network: {
                    en: 'Network issue during voice recognition. Please check your internet connection.',
                    mr: 'व्हॉइस ओळखीदरम्यान नेटवर्क अडचण आली. कृपया इंटरनेट तपासा.',
                    hi: 'वॉयस इनपुट के दौरान नेटवर्क समस्या आई। कृपया इंटरनेट कनेक्शन जांचें।'
                },
                listening: {
                    en: 'Listening in English... Speak now.',
                    mr: 'मराठीत ऐकत आहे... आता बोला.',
                    hi: 'हिंदी में सुन रहे हैं... अब बोलिए।'
                }
            };

            const dict = messages[type] || {};
            return dict[currentLang] || dict['en'] || 'Voice input notice';
        },

        start(langCode, onResultCallback, onErrorCallback) {
            if (!this.isSupported()) {
                this.setState('unsupported');
                const msg = this.getLocalizedMessage('unsupported', langCode);
                if (window.Utils && window.Utils.showToast) {
                    window.Utils.showToast(msg, 'warning', 4500);
                }
                if (onErrorCallback) onErrorCallback(new Error(msg), 'unsupported');
                return false;
            }

            // Prevent duplicate sessions
            if (this.isListening && this.recognition) {
                this.stop();
                return false;
            }

            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();

                const uiLang = langCode || (window.I18n ? window.I18n.getCurrentLanguage() : 'en');
                const speechLang = this.getLanguageCode(uiLang);
                this.activeLang = speechLang;

                this.recognition.lang = speechLang;
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.maxAlternatives = 1;

                this.recognition.onstart = () => {
                    this.setState('listening', { lang: speechLang, uiLang });
                };

                this.recognition.onresult = (event) => {
                    this.setState('processing');
                    if (event.results && event.results[0] && event.results[0][0]) {
                        const transcript = event.results[0][0].transcript;
                        if (onResultCallback) onResultCallback(transcript);
                    }
                };

                this.recognition.onerror = (event) => {
                    const errName = event.error || 'unknown';
                    let stateType = 'error';
                    let userMsg = '';

                    if (errName === 'not-allowed' || errName === 'service-not-allowed') {
                        stateType = 'permission_denied';
                        userMsg = this.getLocalizedMessage('denied', uiLang);
                    } else if (errName === 'no-speech') {
                        stateType = 'error';
                        userMsg = this.getLocalizedMessage('no_speech', uiLang);
                    } else if (errName === 'network') {
                        stateType = 'error';
                        userMsg = this.getLocalizedMessage('network', uiLang);
                    } else if (errName === 'aborted') {
                        stateType = 'idle';
                    } else {
                        stateType = 'error';
                        userMsg = `Voice recognition notice: ${errName}`;
                    }

                    this.setState(stateType, { error: errName });

                    if (userMsg && window.Utils && window.Utils.showToast && errName !== 'aborted') {
                        window.Utils.showToast(userMsg, stateType === 'permission_denied' ? 'error' : 'info', 4000);
                    }

                    if (onErrorCallback && errName !== 'aborted') {
                        onErrorCallback(event, stateType);
                    }

                    this.stop();
                };

                this.recognition.onend = () => {
                    if (this.state === 'listening' || this.state === 'processing') {
                        this.setState('idle');
                    }
                    this.recognition = null;
                };

                this.recognition.start();
                return true;
            } catch (err) {
                console.error('Failed to start speech recognition:', err);
                this.setState('error', { error: err.message });
                if (onErrorCallback) onErrorCallback(err, 'error');
                return false;
            }
        },

        stop() {
            if (this.recognition) {
                try {
                    this.recognition.stop();
                } catch (e) {}
            }
            this.setState('idle');
            this.recognition = null;
        },

        cancel() {
            if (this.recognition) {
                try {
                    this.recognition.abort();
                } catch (e) {}
            }
            this.setState('idle');
            this.recognition = null;
        }
    };

    if (typeof window !== 'undefined') {
        window.Voice = Voice;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Voice;
    }
})();
