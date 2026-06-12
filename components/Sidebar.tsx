'use client'

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, MessageSquare, Trash2 } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  date: string
  messages?: Array<any>
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  conversations: Conversation[]
  activeId: string
  onSelectConversation: (id: string) => void
  onNewChat: () => void
}

export default function Sidebar({
  isOpen,
  onToggle,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <>
      {/* Sidebar */}
      <div
        className={`flex flex-col border-r border-border/50 bg-card transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          {isOpen && <h2 className="text-sm font-semibold text-foreground">History</h2>}
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* New Chat Button - Modern Style */}
        <button
          onClick={onNewChat}
          className="m-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onMouseEnter={() => setHoveredId(conversation.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative mb-1 cursor-pointer rounded-lg p-3 transition-all duration-150 ${
                  activeId === conversation.id
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/10 border border-primary/30'
                    : 'text-foreground hover:bg-muted/60 border border-transparent'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/70" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{conversation.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{conversation.date}</p>
                  </div>
                </div>

                {/* Delete Button */}
                {hoveredId === conversation.id && (
                  <button className="absolute right-2 top-2.5 flex h-6 w-6 items-center justify-center rounded-lg bg-destructive/15 text-destructive transition-all duration-150 hover:bg-destructive/25">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 p-3 text-xs text-muted-foreground text-center">
          <p>v1.0</p>
        </div>
      </div>

      {/* Toggle Button when Sidebar is Closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-0 top-1/2 -translate-y-1/2 flex h-14 w-12 items-center justify-center rounded-r-2xl bg-gradient-to-b from-primary to-secondary text-white transition-all duration-200 hover:shadow-xl hover:w-14 hover:pr-1 z-40 group"
          title="Open sidebar"
        >
          <ChevronRight className="h-6 w-6 group-hover:scale-125 transition-transform duration-200" />
        </button>
      )}
    </>
  )
}
