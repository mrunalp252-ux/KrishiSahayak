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

            // Voice input integration with clear states and active locale sync
            if (voiceBtn) {
                const updateVoiceBtnUI = (state, lang) => {
                    const currentLang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';
                    if (state === 'listening') {
                        voiceBtn.classList.add('voice-listening-pulse');
                        voiceBtn.style.color = '#ef4444';
                        voiceBtn.style.background = 'rgba(239, 68, 68, 0.15)';
                        voiceBtn.title = currentLang === 'mr' ? 'ऐकत आहे... थांबवण्यासाठी क्लिक करा' : (currentLang === 'hi' ? 'सुन रहा है... रोकने के लिए क्लिक करें' : 'Listening... Click to stop');
                        this.showVoiceStatus(window.Voice ? window.Voice.getLocalizedMessage('listening', currentLang) : 'Listening...');
                    } else if (state === 'processing') {
                        voiceBtn.classList.remove('voice-listening-pulse');
                        voiceBtn.style.color = '#f59e0b';
                        voiceBtn.style.background = '';
                        voiceBtn.title = 'Processing voice...';
                        this.showVoiceStatus(currentLang === 'mr' ? 'आवाज प्रक्रिया सुरू आहे...' : (currentLang === 'hi' ? 'वॉयस प्रोसेस हो रहा है...' : 'Processing speech...'));
                    } else {
                        voiceBtn.classList.remove('voice-listening-pulse');
                        voiceBtn.style.color = '';
                        voiceBtn.style.background = '';
                        voiceBtn.title = currentLang === 'mr' ? 'माइकने बोला (व्हॉइस इनपुट)' : (currentLang === 'hi' ? 'माइक से बोलें (वॉयस इनपुट)' : 'Voice Input (Speak)');
                        this.hideVoiceStatus();
                    }
                };

                window.addEventListener('voiceStateChange', (e) => {
                    const detail = e.detail || {};
                    updateVoiceBtnUI(detail.state, detail.uiLang);
                });

                voiceBtn.addEventListener('click', () => {
                    if (!window.Voice || !window.Voice.isSupported()) {
                        const currentLang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';
                        const msg = window.Voice && window.Voice.getLocalizedMessage 
                            ? window.Voice.getLocalizedMessage('unsupported', currentLang)
                            : 'Voice recognition not supported in this browser. You can type your message.';
                        if (window.Utils && window.Utils.showToast) {
                            window.Utils.showToast(msg, 'warning', 4000);
                        }
                        return;
                    }

                    if (window.Voice.isListening) {
                        window.Voice.stop();
                    } else {
                        const lang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';
                        window.Voice.start(lang, (transcript) => {
                            if (input) {
                                input.value = transcript;
                                input.focus();
                            }
                            const cue = lang === 'mr' ? 'आवाज ओळखला. आपण पाठवण्यापूर्वी बदल करू शकता.' : (lang === 'hi' ? 'आवाज़ पहचानी गई। आप भेजने से पहले बदलाव कर सकते हैं।' : 'Voice recognized. You can edit before sending.');
                            if (window.Utils && window.Utils.showToast) {
                                window.Utils.showToast(cue, 'info', 2500);
                            }
                        });
                    }
                });
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

        showVoiceStatus(message) {
            let banner = document.getElementById('voice-status-banner');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'voice-status-banner';
                banner.style.cssText = 'padding:6px 12px; margin-bottom:8px; background:#fef3c7; color:#92400e; border-radius:6px; font-size:0.85rem; display:flex; align-items:center; gap:6px; animation:fadeIn 0.2s ease;';
                const container = document.querySelector('.chat-container');
                if (container) container.insertBefore(banner, container.querySelector('.chat-input'));
            }
            banner.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; animation:pulse 1s infinite;"></span> ${window.Utils ? window.Utils.sanitizeHtml(message) : message}`;
            banner.style.display = 'flex';
        },

        hideVoiceStatus() {
            const banner = document.getElementById('voice-status-banner');
            if (banner) banner.style.display = 'none';
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
            const userLang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';
            formData.append('language', userLang);

            this.appendMessage('user', `📷 [Uploaded Image: ${file.name}] Please diagnose this crop disease or pest.`);
            const loadingBubble = this.appendLoading(userLang === 'mr' ? 'कृत्रिम बुद्धिमत्ता (AI) पिकाच्या पानाचे विश्लेषण करत आहे...' : (userLang === 'hi' ? 'कृत्रिम बुद्धिमत्ता (AI) फसल की पत्ती का विश्लेषण कर रही है...' : 'AI Plant Doctor is analyzing crop image...'));

            try {
                const res = await (window.API.upload ? window.API.upload('/ai/analyze-crop', formData) : window.API.post('/ai/analyze-crop', formData));
                if (loadingBubble) loadingBubble.remove();

                const d = res.data?.data || res.data || res.analysis || {};
                const isUnclear = Boolean(d.isUnclear || res.isUnclear);
                const cropName = d.plantIdentified || 'Crop Plant';
                const problem = d.possibleProblem || res.diagnosis || 'Plant Issue';
                const confidence = d.confidenceScore || 75;
                const severity = d.severity || 'moderate';

                const badgeColors = {
                    low: '#10b981',
                    moderate: '#f59e0b',
                    high: '#ef4444',
                    critical: '#b91c1c'
                };
                const sevColor = badgeColors[severity] || '#f59e0b';

                let cardHtml = '';
                if (isUnclear) {
                    cardHtml = `
                        <div class="diagnosis-card" style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:14px; margin-top:6px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <h4 style="margin:0; color:#b45309; font-size:1rem;">⚠️ ${userLang === 'mr' ? 'फोटो अस्पष्ट / कमी खात्री' : (userLang === 'hi' ? 'तस्वीर अस्पष्ट / कम आत्मविश्वास' : 'Image Unclear / Low Confidence')}</h4>
                                <span class="badge" style="background:#fef3c7; color:#92400e; font-size:0.75rem; padding:2px 8px; border-radius:12px;">Confidence: ${confidence}%</span>
                            </div>
                            <p style="margin:0 0 8px 0; font-size:0.9rem; color:#78350f;">${problem}</p>
                            <div style="font-size:0.85rem; color:#451a03; margin-bottom:10px;">
                                <strong>${userLang === 'mr' ? 'शेतकरी बंधूंसाठी सूचना:' : (userLang === 'hi' ? 'किसान भाइयों के लिए सुझाव:' : 'Guidance for Farmer:')}</strong>
                                <ul style="margin:4px 0 0 16px; padding:0;">
                                    <li>${userLang === 'mr' ? 'चांगल्या सूर्यप्रकाशात जवळून स्पष्ट फोटो काढा.' : (userLang === 'hi' ? 'अच्छी धूप में पास से स्पष्ट तस्वीर खींचें।' : 'Take a clear close-up in natural daylight.')}</li>
                                    <li>${userLang === 'mr' ? 'बाधित भाग आणि निरोगी पान दोन्ही दिसेल असा फोटो घ्या.' : (userLang === 'hi' ? 'प्रभावित भाग और स्वस्थ पत्ती दोनों दिखे ऐसा फोटो लें।' : 'Capture both affected and healthy portions of the leaf.')}</li>
                                    <li>${userLang === 'mr' ? 'पिकाचे नाव व लक्षणे लिहून विचारा.' : (userLang === 'hi' ? 'फसल का नाम व लक्षण लिखकर पूछें।' : 'Provide crop name and observed symptoms in text.')}</li>
                                </ul>
                            </div>
                            <div style="border-top:1px dashed #fcd34d; padding-top:8px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.8rem; color:#92400e;">${userLang === 'mr' ? 'कृषी तज्ज्ञांशी संपर्क साधायचा आहे का?' : (userLang === 'hi' ? 'कृषि विशेषज्ञ से पूछना चाहते हैं?' : 'Need a human agronomist?')}</span>
                                <a href="expert-dashboard.html" class="btn btn-sm btn-outline-primary" style="text-decoration:none;">${userLang === 'mr' ? 'कृषी तज्ज्ञांना विचारा 🎓' : (userLang === 'hi' ? 'कृषि विशेषज्ञ से पूछें 🎓' : 'Ask Expert 🎓')}</a>
                            </div>
                        </div>
                    `;
                } else {
                    const immediateHtml = Array.isArray(d.immediateActions) && d.immediateActions.length > 0 
                        ? `<ol style="margin:4px 0 8px 18px; padding:0; font-size:0.88rem; color:#374151;">${d.immediateActions.map(a => `<li>${a}</li>`).join('')}</ol>`
                        : '';
                    const symptomsHtml = Array.isArray(d.symptomsDetected) && d.symptomsDetected.length > 0
                        ? `<p style="margin:0 0 6px 0; font-size:0.88rem; color:#4b5563;"><strong>🔍 ${userLang === 'mr' ? 'दिसणारी लक्षणे:' : (userLang === 'hi' ? 'लक्षण:' : 'Symptoms Detected:')}</strong> ${d.symptomsDetected.join(', ')}</p>`
                        : '';

                    cardHtml = `
                        <div class="diagnosis-card" style="background:var(--surface, #ffffff); border:1px solid rgba(0,0,0,0.08); border-radius:10px; padding:14px; margin-top:6px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #f3f4f6; padding-bottom:6px;">
                                <h4 style="margin:0; color:var(--primary-dark, #065f46); font-size:1.05rem;">🩺 ${userLang === 'mr' ? 'पीक रोग निदान अहवाल' : (userLang === 'hi' ? 'फसल रोग निदान रिपोर्ट' : 'AI Plant Doctor Diagnosis')}</h4>
                                <span class="badge" style="background:${sevColor}; color:white; font-size:0.75rem; padding:2px 8px; border-radius:12px; text-transform:uppercase;">${severity}</span>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px; font-size:0.88rem;">
                                <div><strong>🌱 ${userLang === 'mr' ? 'पीक:' : (userLang === 'hi' ? 'फसल:' : 'Crop:')}</strong> ${cropName}</div>
                                <div><strong>📊 ${userLang === 'mr' ? 'अचूकता खात्री:' : (userLang === 'hi' ? 'आत्मविश्वास:' : 'Confidence:')}</strong> ${confidence}%</div>
                            </div>
                            <div style="background:#ecfdf5; border-left:3px solid #10b981; padding:8px 10px; border-radius:4px; margin-bottom:8px;">
                                <strong style="color:#065f46; font-size:0.92rem;">⚠️ ${userLang === 'mr' ? 'संभाव्य समस्या / रोग:' : (userLang === 'hi' ? 'संभावित समस्या / रोग:' : 'Possible Problem:')}</strong>
                                <div style="font-size:0.95rem; font-weight:600; color:#047857; margin-top:2px;">${problem}</div>
                            </div>
                            ${symptomsHtml}
                            ${immediateHtml ? `<div style="margin-top:6px;"><strong style="font-size:0.88rem; color:#1f2937;">⚡ ${userLang === 'mr' ? 'तात्काळ काय करावे:' : (userLang === 'hi' ? 'तत्काल क्या करें:' : 'Immediate Actions:')}</strong>${immediateHtml}</div>` : ''}
                            ${d.treatmentGuidance ? `<div style="background:#f9fafb; padding:8px 10px; border-radius:6px; margin-bottom:8px; font-size:0.85rem; line-height:1.5; color:#374151;"><strong>🛡️ ${userLang === 'mr' ? 'उपचार व नियंत्रण मार्गदर्शन:' : (userLang === 'hi' ? 'उपचार एवं नियंत्रण मार्गदर्शन:' : 'Treatment Guidance:')}</strong> ${d.treatmentGuidance}</div>` : ''}
                            ${d.plantCare ? `<div style="font-size:0.85rem; color:#4b5563; margin-bottom:8px;"><strong>🌿 ${userLang === 'mr' ? 'पीक निगा व काळजी:' : (userLang === 'hi' ? 'पौधे की देखभाल:' : 'Plant Care:')}</strong> ${d.plantCare}</div>` : ''}
                            <div style="border-top:1px dashed #e5e7eb; padding-top:8px; margin-top:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                                <span style="font-size:0.78rem; color:#6b7280;">⚠️ ${userLang === 'mr' ? 'निदान संभाव्य आहे. आवश्यकतेनुसार कृषी तज्ज्ञांचा सल्ला घ्या.' : (userLang === 'hi' ? 'निदान संभावित है। आवश्यकतानुसार कृषि विशेषज्ञ से सलाह लें।' : 'Probabilistic diagnosis. Follow product label & consult agronomist.')}</span>
                                <a href="expert-dashboard.html" class="btn btn-sm btn-outline-primary" style="text-decoration:none;">${userLang === 'mr' ? 'तज्ज्ञांना विचारा 🎓' : (userLang === 'hi' ? 'विशेषज्ञ से पूछें 🎓' : 'Ask Expert 🎓')}</a>
                            </div>
                        </div>
                    `;
                }

                this.appendMessage('assistant', cardHtml);
            } catch (err) {
                if (loadingBubble) loadingBubble.remove();
                const cleanErr = window.Utils && window.Utils.cleanErrorMessage ? window.Utils.cleanErrorMessage(err.message) : err.message;
                const errNotice = userLang === 'mr' 
                    ? `फोटो निदान सध्या उपलब्ध नाही: ${cleanErr}. आपण लक्षणांचे वर्णन लिहू शकता किंवा कृषी तज्ज्ञांशी संपर्क साधू शकता.` 
                    : (userLang === 'hi' 
                        ? `तस्वीर निदान वर्तमान में उपलब्ध नहीं है: ${cleanErr}। आप लक्षणों का वर्णन लिखकर पूछ सकते हैं या विशेषज्ञ से संपर्क कर सकते हैं।` 
                        : `Visual diagnosis unavailable: ${cleanErr}. You can describe symptoms in text or consult our expert board.`);
                this.appendMessage('assistant', errNotice);
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
