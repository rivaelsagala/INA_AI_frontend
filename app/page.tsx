'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ChatArea from '@/components/ChatArea'
import InputArea from '@/components/InputArea'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

type Conversation = {
  id: string
  title: string
  date: string
  messages: Message[]
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Initial Consultation',
      date: 'Today',
      messages: [],
    },
  ])
  const [activeConversationId, setActiveConversationId] = useState('1')
  const [messages, setMessages] = useState<Message[]>([])

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  const handleNewChat = () => {
    const newId = Date.now().toString()
    const newConversation = {
      id: newId,
      title: 'New Conversation',
      date: 'Just now',
      messages: [],
    }
    setConversations([newConversation, ...conversations])
    setActiveConversationId(newId)
    setMessages([])
  }

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id)
    const conversation = conversations.find((c) => c.id === id)
    setMessages(conversation?.messages || [])
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Based on your question about "${message.substring(0, 30)}...", here's a professional medical perspective:\n\nThis is a sample response. In a production environment, this would be connected to a real AI medical consultation service. Please note that this is for informational purposes and should not replace professional medical advice.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMessage])

      // Update conversation
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: [...(c.messages || []), userMessage, aiMessage],
                title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                date: 'Just now',
              }
            : c
        )
      )
    }, 1000)
  }

  const handleClearChat = () => {
    setMessages([])
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, messages: [] } : c))
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header selectedModel={selectedModel} onModelChange={setSelectedModel} />

        {/* Chat Area */}
        <ChatArea
          messages={messages}
          selectedModel={selectedModel}
          conversationTitle={activeConversation?.title || 'Chat'}
        />

        {/* Input Area */}
        <InputArea onSendMessage={handleSendMessage} onClearChat={handleClearChat} />
      </div>
    </div>
  )
}
