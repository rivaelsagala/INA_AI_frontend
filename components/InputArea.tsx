'use client'

import { useState, useRef } from 'react'
import { Send, Upload, Trash2 } from 'lucide-react'

interface InputAreaProps {
  onSendMessage: (message: string) => void
  onClearChat: () => void
}

export default function InputArea({ onSendMessage, onClearChat }: InputAreaProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="border-t border-border/50 bg-gradient-to-t from-background to-background/80 px-4 py-4 sm:py-5 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className={`rounded-2xl border transition-all duration-200 backdrop-blur-sm ${isFocused ? 'border-primary/60 bg-card shadow-lg shadow-primary/10' : 'border-border/50 bg-card/80'}`}>
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask me about your health, symptoms, or medical questions..."
              className="max-h-[120px] resize-none bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
              rows={1}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-110"
                  title="Upload file or PDF"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onClearChat}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 hover:bg-destructive/10 text-muted-foreground hover:text-destructive hover:scale-110"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Send Button - Modern Style */}
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white transition-all duration-200 hover:shadow-lg hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Send message (Enter)"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Informational AI only. Always consult healthcare professionals for medical advice.
        </p>
      </div>
    </div>
  )
}
