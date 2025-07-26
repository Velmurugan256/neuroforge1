"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2, RotateCcw, Settings } from "lucide-react"
import { toast } from "sonner"
import { sendQuestionToRAG, formatRAGResponse, getErrorMessage } from "@/api/rag"

const ChatInterface = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your NeuroForge AI assistant. I can help you with document analysis, answer questions about your uploaded files, and assist with various tasks. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const question = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    try {
      // Call the NeuroForge RAG API
      const ragResponse = await sendQuestionToRAG(question)
      
      // Format the response for display
      const formattedResponse = formatRAGResponse(ragResponse, question)

      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: formattedResponse,
        timestamp: new Date(),
        ragData: ragResponse, // Store original data for potential future use
      }

      setMessages((prev) => [...prev, botResponse])
      
      // Show success toast if we got good results
      if (ragResponse.matches && ragResponse.matches.length > 0) {
        toast.success(`Found ${ragResponse.matches.length} relevant result${ragResponse.matches.length !== 1 ? 's' : ''}`)
      }
      
    } catch (error) {
      console.error('RAG API Error:', error)
      
      // Create error response message
      const errorMessage = getErrorMessage(error)
      const errorResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: `❌ **Error**: ${errorMessage}\n\nPlease try:\n• Rephrasing your question\n• Checking your internet connection\n• Contacting support if the issue persists`,
        timestamp: new Date(),
        isError: true,
      }

      setMessages((prev) => [...prev, errorResponse])
      
      // Show error toast
      toast.error("Failed to get response", { 
        description: errorMessage.length > 50 ? errorMessage.substring(0, 50) + "..." : errorMessage 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ])
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Helper function to render formatted message content
  const renderMessageContent = (message) => {
    const { content, isError } = message
    
    // Basic markdown-like formatting for bot responses
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/📄/g, '📄') // Keep emojis
      .replace(/🆔/g, '🆔')
      .replace(/❌/g, '❌')

    return (
      <div 
        className={`text-sm leading-relaxed whitespace-pre-wrap ${isError ? 'text-red-100' : ''}`}
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Playground</h2>
            <p className="text-sm text-slate-400">Test your bot interactions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            {message.type === "bot" && (
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === "user" 
                  ? "bg-cyan-600 text-white ml-12" 
                  : message.isError 
                    ? "bg-red-900/50 border border-red-700/50 text-red-100 mr-12" 
                    : "bg-slate-800/80 text-slate-100 mr-12"
              }`}
            >
              {message.type === "user" ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              ) : (
                renderMessageContent(message)
              )}
              <p className={`text-xs mt-2 ${
                message.type === "user" 
                  ? "text-cyan-100" 
                  : message.isError 
                    ? "text-red-300" 
                    : "text-slate-400"
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>

            {message.type === "user" && (
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800/80 rounded-2xl px-4 py-3 mr-12">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-sm text-slate-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your documents..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all duration-200 min-h-[48px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3 text-xs text-slate-500">{inputValue.length}/1000</div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:shadow-none flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Connected
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
