/* ============================================================
   Voice Input — Bengali Speech Recognition (Web Speech API)
   Lets farmers describe symptoms by voice instead of typing.
   Gracefully falls back if browser lacks Bengali speech recognition.
   ============================================================ */

(function () {
  'use strict';

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null;

  window.VOICE_INPUT = {
    recognition: null,
    isListening: false,
    supported: !!SpeechRecognition,
    bnLang: 'bn-BD',
    onResult: null,
    onError: null,
    onEnd: null,

    init() {
      if (!SpeechRecognition) {
        console.warn('SpeechRecognition not supported in this browser');
        return false;
      }
      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.bnLang;
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        if (this.onResult) this.onResult(transcript, confidence);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (this.onError) this.onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEnd) this.onEnd();
      };

      return true;
    },

    start() {
      if (!this.recognition) return false;
      if (this.isListening) this.stop();
      try {
        this.recognition.start();
        this.isListening = true;
        return true;
      } catch (e) {
        console.warn('Failed to start recognition:', e);
        return false;
      }
    },

    stop() {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      }
    },

    isSupported() {
      return this.supported;
    }
  };
})();