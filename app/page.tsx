'use client'

import { useState, useEffect } from 'react'
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

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
const DEFAULT_USER_ID = 1

export default function Home() {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  // 1. Fetch Sessions saat pertama kali load
  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat-sessions?user_id=${DEFAULT_USER_ID}`)
      if (res.ok) {
        const responseJson = await res.json()
        
        // Mengambil array "data" dari respon backend {"status": "success", "data": [...]}
        const sessionsArray = responseJson.data || []
        
        const formattedSessions = sessionsArray.map((session: any) => ({
          id: session.id.toString(),
          title: session.session_name || 'New Conversation',
          date: new Date(session.created_at || Date.now()).toLocaleDateString(),
          messages: []
        }))
        
        setConversations(formattedSessions)
        
        if (formattedSessions.length > 0) {
          handleSelectConversation(formattedSessions[0].id)
        } else {
          handleNewChat()
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  // 2. Fetch Chat History berdasarkan session_id
  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id)
    try {
      const res = await fetch(`${API_BASE_URL}/chat-history/${id}`)
      if (res.ok) {
        const responseJson = await res.json()
        const historyArray = responseJson.data || []
        
        const historyMessages: Message[] = []
        
        // Backend mengembalikan "user_query" dan "llm_response" di baris yang sama.
        historyArray.forEach((row: any) => {
          const time = new Date(row.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          
          // Pesan User
          historyMessages.push({
            id: `user-${row.id}`,
            role: 'user',
            content: row.user_query,
            timestamp: time
          })
          
          // Pesan AI
          historyMessages.push({
            id: `ast-${row.id}`,
            role: 'assistant',
            content: row.llm_response,
            timestamp: time
          })
        })
        
        setMessages(historyMessages)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
      setMessages([])
    }
  }

  // 3. Buat Session Baru
  const handleNewChat = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: DEFAULT_USER_ID, session_name: 'New Conversation' }) // Backend memakai field 'session_name'
      })
      
      if (res.ok) {
        const responseJson = await res.json()
        
        // Backend return data: { id: ..., session_name: ... }
        const newId = responseJson.data.id.toString()
        const newConversation = {
          id: newId,
          title: 'New Conversation',
          date: 'Just now',
          messages: [],
        }
        setConversations(prev => [newConversation, ...prev])
        setActiveConversationId(newId)
        setMessages([])
        
        return newId // Mengembalikan ID agar bisa dipakai langsung saat mengirim pesan
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
    return null
  }

  // 4. Kirim Pesan ke API Chat
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      let currentSessionId = activeConversationId
      
      // Jika belum ada sesi aktif, buat sesi dan tunggu hasilnya
      if (!currentSessionId) {
         const newId = await handleNewChat()
         if (newId) {
             currentSessionId = newId
         } else {
             throw new Error("Gagal membuat sesi baru")
         }
      }

      // Mapping string model frontend ke angka model_id backend
      const modelMap: Record<string, number> = {
        'llama': 1,
        'qwen': 2,
        'deepseek': 3,
        'gpt-4o-mini': 4, 
        'gemini': 4 
      }
      const modelId = modelMap[selectedModel.toLowerCase()] || 4

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: parseInt(currentSessionId),
          user_id: DEFAULT_USER_ID,
          message: message,    
          model_id: modelId    
        })
      })

      if (res.ok) {
        const data = await res.json()
        
        let aiContent = data.answer || "Maaf, saya tidak dapat memproses permintaan Anda."
        
        if (data.citations && data.citations.length > 0) {
          aiContent += "\n\n**Sumber Referensi:**"
          data.citations.forEach((cit: any) => {
            aiContent += `\n${cit.id} ${cit.source}`
          })
        }

        if (data.confidence_disclaimer) {
          aiContent += `\n\n_${data.confidence_disclaimer}_`
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }

        setMessages((prev) => [...prev, aiMessage])

        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentSessionId
              ? { ...c, title: message.substring(0, 30) + (message.length > 30 ? '...' : '') }
              : c
          )
        )
      } else {
         const errorData = await res.json()
         throw new Error(errorData.error || "Terjadi kesalahan di server")
      }
    } catch (error: any) {
      console.error('Failed to send message:', error)
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Maaf, terjadi kesalahan: ${error.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // 5. Hapus Sesi
  const handleClearChat = async () => {
    if (!activeConversationId) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/chat-sessions/${activeConversationId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        const updatedConversations = conversations.filter(c => c.id !== activeConversationId)
        setConversations(updatedConversations)
        
        if (updatedConversations.length > 0) {
          handleSelectConversation(updatedConversations[0].id)
        } else {
          setMessages([])
          setActiveConversationId('')
          handleNewChat()
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-1 flex-col">
        <Header selectedModel={selectedModel} onModelChange={setSelectedModel} />
        <ChatArea
          messages={messages}
          selectedModel={selectedModel}
          conversationTitle={activeConversation?.title || 'New Chat'}
        />
        <InputArea onSendMessage={handleSendMessage} onClearChat={handleClearChat} />
      </div>
    </div>
  )
}