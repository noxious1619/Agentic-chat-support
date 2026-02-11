'use client'

import { useState, useEffect } from 'react'

type Message = {
  role: 'user' | 'agent'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [dotCount, setDotCount] = useState(1)

  const [isBlocked, setIsBlocked] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // 🔥 Typing animation
  useEffect(() => {
    if (!isThinking) return

    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1)
    }, 400)

    return () => clearInterval(interval)
  }, [isThinking])

  // 🔥 Cooldown countdown
  useEffect(() => {
    if (!isBlocked) return

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsBlocked(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isBlocked])

  async function sendMessage() {
    if (!input.trim() || isBlocked) return

    const userMessage = {
      role: 'user' as const,
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    const response = await fetch(
      'http://localhost:3001/api/chat/messages',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'persist-test',
          content: input,
        }),
      }
    )

    // 🔥 Handle rate limit
    if (response.status === 429) {
      const error = await response.json()

      setIsBlocked(true)
      setCooldown(10)
      setIsThinking(false)

      alert(error.error)
      return
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    let agentText = ''

    // Add empty agent message
    setMessages((prev) => [
      ...prev,
      { role: 'agent', content: '' },
    ])

    setIsThinking(false)

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      const chunk = decoder.decode(value)
      agentText += chunk

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'agent',
          content: agentText,
        }
        return updated
      })
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Support Chat</h1>

      <div
        style={{
          minHeight: 300,
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf:
                msg.role === 'user'
                  ? 'flex-end'
                  : 'flex-start',
              background:
                msg.role === 'user'
                  ? '#0070f3'
                  : '#f1f1f1',
              color:
                msg.role === 'user'
                  ? 'white'
                  : 'black',
              padding: '10px 14px',
              borderRadius: 16,
              maxWidth: '70%',
            }}
          >
            {msg.content}
          </div>
        ))}

        {isThinking && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: '#f1f1f1',
              color: 'black',
              padding: '10px 14px',
              borderRadius: 16,
              maxWidth: '70%',
            }}
          >
            typing{'.'.repeat(dotCount)}
          </div>
        )}
      </div>

      {isBlocked && (
        <div style={{ color: 'red', marginBottom: 10 }}>
          Too many messages. Try again in {cooldown}s.
        </div>
      )}

      <div
  style={{
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  }}
>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={isBlocked}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage()
          }
        }}
        style={{
          flex: 1,
          padding: '12px 14px',
          borderRadius: 20,
          border: '1px solid #ccc',
          outline: 'none',
          fontSize: 14,
          opacity: isBlocked ? 0.6 : 1,
        }}
      />

      <button
        onClick={sendMessage}
        disabled={isBlocked}
        style={{
          padding: '10px 18px',
          borderRadius: 20,
          border: 'none',
          background: isBlocked ? '#999' : '#0070f3',
          color: 'white',
          fontWeight: 500,
          cursor: isBlocked ? 'not-allowed' : 'pointer',
          transition: '0.2s ease',
        }}
      >
        {isBlocked ? `Wait ${cooldown}s` : 'Send'}
      </button>
    </div>

    </div>
  )
}
