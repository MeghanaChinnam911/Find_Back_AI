import React, { useState } from 'react';
import { Bot, Mic, MicOff, Send, X, Terminal, CheckCircle2 } from 'lucide-react';
import { AgentQueryResponse } from '../types';
import { AgentAPI } from '../services/api';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQueryResult: (result: AgentQueryResponse) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onApplyQueryResult
}) => {
  const [queryText, setQueryText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; response?: AgentQueryResponse; text?: string }>>([
    {
      sender: 'agent',
      text: 'Welcome to **Find-Back Assistant**. Ask natural language queries using text or voice to search cases, analyze regional density, and filter geospatial data.'
    }
  ]);

  const sampleQueries = [
    "Show missing children aged 8 to 15 in Vijayawada",
    "How many children are currently missing?",
    "Which area has the highest number of active cases?",
    "Show cases reported in the last 30 days",
    "Show me high-risk priority areas"
  ];

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQueryText(transcript);
      setIsListening(false);
      handleSendQuery(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSendQuery = async (overrideText?: string) => {
    const textToSend = overrideText || queryText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend;
    setQueryText('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const res = await AgentAPI.query(userMessage);
      setMessages(prev => [...prev, { sender: 'agent', response: res }]);
      onApplyQueryResult(res);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'agent',
        text: 'Issue querying backend assistant tool service. Please retry.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-surface border-l border-border shadow-modal flex flex-col transition-all">
      
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-main">Find-Back Assistant</h3>
            <p className="text-[11px] text-text-muted">Search cases, analyze trends & explore locations</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-text-main"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        
        {/* Preset Query Chips */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-text-muted">Suggested Queries:</p>
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSendQuery(sq)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-surface border border-border text-text-main hover:bg-surface-subtle transition-colors text-left"
              >
                "{sq}"
              </button>
            ))}
          </div>
        </div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            
            {msg.sender === 'user' ? (
              <div className="max-w-[85%] p-3 rounded-xl bg-primary text-white font-medium">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[95%] p-3.5 rounded-xl bg-surface-subtle border border-border text-text-main space-y-2">
                
                {msg.text && (
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                )}

                {msg.response && (
                  <>
                    {/* Tool trace */}
                    {msg.response.tool_calls.length > 0 && (
                      <div className="p-2 rounded-lg bg-surface border border-border font-mono text-[10px] space-y-1 text-text-muted">
                        <div className="flex items-center gap-1 font-bold text-primary border-b border-border pb-1">
                          <Terminal className="w-3 h-3" />
                          <span>Tool Execution Trace</span>
                        </div>
                        {msg.response.tool_calls.map((tc, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-accent" />
                            <span className="font-semibold text-text-main">{tc.tool_name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="whitespace-pre-line leading-relaxed text-text-main">
                      {msg.response.answer}
                    </div>
                  </>
                )}

              </div>
            )}

          </div>
        ))}

        {isLoading && (
          <div className="p-3 rounded-xl bg-surface-subtle border border-border text-text-muted flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary animate-spin" />
            <span>Processing query and executing database tools...</span>
          </div>
        )}

      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-border bg-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-lg border transition-colors ${
              isListening
                ? 'bg-danger text-white border-danger animate-pulse'
                : 'bg-surface border-border text-text-muted hover:text-text-main'
            }`}
            title={isListening ? "Listening... click to stop" : "Voice Input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder={isListening ? "Listening..." : "Search cases or ask a question..."}
            className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={isLoading || !queryText.trim()}
            className="p-2.5 rounded-lg bg-primary text-white disabled:opacity-50 hover:bg-primary-hover transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
