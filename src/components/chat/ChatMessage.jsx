import React from "react";
import { Bot, User, Copy, Check, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ChatMessage({ message }) {
  const [copied, setCopied] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const isUser = message.role === "user" || message.sender === "user";
  const isError = message.success === false;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakMessage = async () => {
    if (isSpeaking) {
      // Stop speaking: try Web Speech API first
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      try {
        await fetch('http://127.0.0.1:8000/speak/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        setIsSpeaking(false);
      } catch (error) {
        console.error("Error stopping speech:", error);
      }
      return;
    }

    // Start speaking: prefer Web Speech API on client (works on Android webview/chrome)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.lang = 'en-US';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
          console.error('Speech synthesis error', e);
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
        return;
      } catch (error) {
        console.warn('Web Speech API failed, falling back to backend TTS', error);
      }
    }

    // Fallback: call backend TTS endpoint
    try {
      setIsSpeaking(true);
      const response = await fetch('http://127.0.0.1:8000/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.content, blocking: false })
      });
      const result = await response.json();
      if (!result.success) {
        console.error('TTS failed:', result.message);
        alert(`TTS Error: ${result.message}`);
        setIsSpeaking(false);
      } else {
        // Estimate duration
        const estimatedDuration = (message.content.split(' ').length / 3) * 1000;
        setTimeout(() => setIsSpeaking(false), estimatedDuration);
      }
    } catch (error) {
      console.error('Error speaking message:', error);
      alert(`TTS Error: ${error.message}`);
      setIsSpeaking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className={`max-w-2xl ${isUser ? "order-first" : ""}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl transition-all duration-200 ${
            isUser
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
              : isError
                ? "bg-red-500/10 text-red-300 border border-red-500/30"
                : "bg-stone-800/50 text-stone-100 border border-stone-700/50 shadow-sm"
          }`}
        >
          {isError && (
            <div className="flex items-center gap-2 mb-2 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="font-medium">Error</span>
            </div>
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {!isUser && (
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
              <span className={`text-xs font-medium ${
                isError ? 'text-red-400/60' : 'text-stone-400'
              }`}>
                {format(new Date(message.timestamp), 'h:mm a')}
              </span>

              <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 sm:h-6 sm:w-6 hover:bg-stone-700/50 rounded-lg ${isSpeaking ? 'bg-orange-500/20' : ''}`}
                    onClick={speakMessage}
                    title={isSpeaking ? "Stop speaking" : "Speak message"}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 h-4 text-orange-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-stone-400" />
                    )}
                  </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-6 sm:w-6 hover:bg-stone-700/50 rounded-lg"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-orange-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-stone-400" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {isUser && (
          <div className="text-xs text-stone-500 mt-1 text-right">
            {format(new Date(message.timestamp), 'h:mm a')}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-stone-700 flex items-center justify-center">
            <User className="w-4 h-4 text-stone-300" />
          </div>
        </div>
      )}
    </motion.div>
  );
}