'use client'

import { useEffect, useRef } from 'react'
import { Bot, User, Loader } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatAreaProps {
  messages: Message[]
  selectedModel: string
  conversationTitle: string
}

export default function ChatArea({ messages, selectedModel, conversationTitle }: ChatAreaProps) {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const isTyping = messages.length > 0 && messages[messages.length - 1]?.role === 'user'

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const formatMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, idx) => (
        <p key={idx} className="mb-2 text-sm leading-relaxed">
          {line}
        </p>
      ))
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center max-w-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/20">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-3 text-2xl sm:text-3xl font-bold text-foreground leading-tight">Med AI Assistant</h2>
          <p className="mb-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Ask me anything about health, symptoms, or medical information. I&apos;m here to help guide you with informational support.
          </p>
          <div className="inline-block rounded-full bg-muted/70 px-4 py-1.5 text-xs sm:text-sm text-foreground border border-border/50">
            Using <span className="font-semibold text-primary">{selectedModel.toUpperCase()}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-gradient-to-br from-background via-background to-muted/10">
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* Conversation Title */}
        <div className="mb-8 pb-4 border-b border-border/50">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">{conversationTitle}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Using {selectedModel.toUpperCase()}</p>
        </div>

        {/* Messages */}
        <div className="space-y-4 sm:space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 sm:gap-4 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent shadow-md">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              )}

              <div
                className={`flex max-w-2xl flex-col gap-1 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 transition-all duration-200 ${
                  message.role === 'assistant'
                    ? 'bg-muted/70 text-foreground border border-border/50'
                    : 'bg-gradient-to-br from-primary to-secondary text-white border border-primary/50'
                }`}
              >
                <div className="text-xs sm:text-sm leading-relaxed">{formatMarkdown(message.content)}</div>
                <p className={`text-xs ${message.role === 'assistant' ? 'text-muted-foreground' : 'text-white/70'}`}>{message.timestamp}</p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-md">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 sm:gap-4 justify-start">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent shadow-md">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-muted/70 px-4 sm:px-5 py-3 sm:py-4 border border-border/50">
                <Loader className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs sm:text-sm text-foreground">Medical AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Scroll Anchor */}
        <div ref={chatEndRef} />
      </div>
    </div>
  )
}
