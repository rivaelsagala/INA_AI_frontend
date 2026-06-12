'use client'

import { ChevronDown, User } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

const models = ['gpt-4', 'gemini', 'claude', 'llama']

export default function Header({ selectedModel, onModelChange }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b border-border/50 bg-gradient-to-r from-background via-background to-background backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* App Title - Minimal and Modern */}
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-md">
            ✨
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-base font-semibold text-foreground leading-tight">Med AI</h1>
            <p className="text-xs text-muted-foreground">Smart Health</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Model Selection - Modern Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 rounded-full bg-muted/60 hover:bg-muted px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-foreground transition-all duration-200 border border-border/50 hover:border-primary/30"
            >
              <span className="capitalize hidden xs:inline">{selectedModel}</span>
              <span className="sm:hidden capitalize">{selectedModel.split('-')[0]}</span>
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-12 z-50 min-w-max rounded-xl border border-border/50 bg-card shadow-xl backdrop-blur-sm overflow-hidden">
                {models.map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      onModelChange(model)
                      setIsOpen(false)
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${selectedModel === model ? 'bg-primary/15 text-primary font-medium' : 'text-foreground hover:bg-muted/50'}`}
                  >
                    {model.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile - Modern Avatar */}
          <button className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent transition-all duration-200 hover:shadow-lg hover:scale-105">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  )
}
