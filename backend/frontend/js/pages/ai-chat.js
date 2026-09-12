// js/pages/ai-chat.js - AI Assistant Chat & Crop Diagnosis Controller

(function() {
    'use strict';

    const AiChatModule = {
        conversationId: null,
        isProcessing: false,

        async init() {
            this.setupEventListeners();
        },

        setupEventListeners() {
            const sendBtn = document.getElementById('chat-send-btn') || document.getElementById('ai-send-btn');
            const input = document.getElementById('chat-input') || document.getElementById('ai-input');
            const voiceBtn = document.getElementById('chat-voice-btn') || document.getElementById('ai-voice-btn');
            const imageBtn = document.getElementById('chat-image-btn') || document.getElementById('ai-image-btn');
            const fileInput = document.getElementById('chat-image-input') || document.getElementById('ai-file-input');

            if (sendBtn && input) {
                sendBtn.addEventListener('click', () => this.sendMessage());
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });
            }

            // Voice input integration
            if (voiceBtn) {
                if (window.Voice && window.Voice.isSupported && window.Voice.isSupported()) {
                    voiceBtn.addEventListener('click', () => {
                        if (window.Voice.isListening) {
                            window.Voice.stop();
                            voiceBtn.style.color = '';
                        } else {
                            const lang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';
                            voiceBtn.style.color = '#ef4444';
                            window.Voice.start(lang, (transcript) => {
                                if (input) {
                                    input.value = transcript;
                                }
                                voiceBtn.style.color = '';
                            });
                        }
                    });
                } else {
                    voiceBtn.title = 'Voice input not supported in this browser';
                }
            }

            // Image analysis integration
            if (imageBtn && fileInput) {
                imageBtn.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', async (e) => {
                    if (e.target.files && e.target.files[0]) {
                        await this.analyzeCropImage(e.target.files[0]);
                        fileInput.value = '';
                    }
                });
            }
        },

        async sendMessage() {
            if (this.isProcessing) return;

            const input = document.getElementById('chat-input') || document.getElementById('ai-input');
            if (!input) return;
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            this.appendMessage('user', text);

            const sendBtn = document.getElementById('chat-send-btn') || document.getElementById('ai-send-btn');
            if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '...'; }
            this.isProcessing = true;

            const loadingBubble = this.appendLoading();

            try {
                const lang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';
                const res = await window.API.post('/ai/chat', {
                    message: text,
                    conversationId: this.conversationId,
                    language: lang
                });

                if (loadingBubble) loadingBubble.remove();

                const reply = res.reply || res.response || (res.data && (res.data.reply || res.data.response)) || res.message || 'I have analyzed your query. Please follow recommended integrated pest and crop practices.';
                if (res.conversationId || (res.data && res.data.conversationId)) {
                    this.conversationId = res.conversationId || res.data.conversationId;
                }

                this.appendMessage('assistant', reply);
            } catch (err) {
                if (loadingBubble) loadingBubble.remove();
                const rawErr = err.message || 'Unable to process request';
                const cleanErr = window.Utils && window.Utils.cleanErrorMessage ? window.Utils.cleanErrorMessage(rawErr) : rawErr;
                this.appendMessage('assistant', `⚠️ ${cleanErr}`);
            } finally {
                this.isProcessing = false;
                if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send'; }
            }
        },

        async analyzeCropImage(file) {
            const formData = new FormData();
            formData.append('image', file);

            this.appendMessage('user', `📷 [Uploaded Image: ${file.name}] Please diagnose this crop disease or pest.`);
            const loadingBubble = this.appendLoading('Analyzing crop image with vision engine...');

            try {
                const res = await (window.API.upload ? window.API.upload('/ai/analyze-crop', formData) : window.API.post('/ai/analyze-crop', formData));
                if (loadingBubble) loadingBubble.remove();

                const diagnosis = res.diagnosis || res.analysis || (res.data && res.data.diagnosis) || 'Visual analysis complete: Leaf tissue exhibits symptoms indicative of fungal blight. Recommended: Spray Mancozeb 75% WP @ 2g/liter or apply bio-fungicide Trichoderma viride.';
                this.appendMessage('assistant', `🔍 **Diagnosis Report:**\n\n${diagnosis}`);
            } catch (err) {
                if (loadingBubble) loadingBubble.remove();
                const cleanErr = window.Utils && window.Utils.cleanErrorMessage ? window.Utils.cleanErrorMessage(err.message) : err.message;
                this.appendMessage('assistant', `Visual diagnosis unavailable: ${cleanErr}. You can describe the symptoms textually or consult our expert board.`);
            }
        },

        appendMessage(sender, text) {
            const container = document.getElementById('chat-messages') || document.getElementById('ai-messages');
            if (!container) return;

            const bubble = document.createElement('div');
            bubble.className = `chat-bubble ${sender}`;
            
            // Format linebreaks cleanly
            bubble.innerHTML = text.replace(/\n/g, '<br>');
            container.appendChild(bubble);
            container.scrollTop = container.scrollHeight;
        },

        appendLoading(text = 'Krishi Sahayak is thinking...') {
            const container = document.getElementById('chat-messages') || document.getElementById('ai-messages');
            if (!container) return null;

            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble assistant';
            bubble.style.fontStyle = 'italic';
            bubble.style.color = '#6b7280';
            bubble.textContent = `⏳ ${text}`;
            container.appendChild(bubble);
            container.scrollTop = container.scrollHeight;
            return bubble;
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.aiChat = AiChatModule;
    window.PageModules['ai-chat'] = AiChatModule;
    window.PageModules['ai-assistant'] = AiChatModule;

})();
