'use client'

import { useState } from 'react'

type Message = {
  role: 'user' | 'agent'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  async function sendMessage() {
    if (!input.trim()) return

    const userMessage = {
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    const response = await fetch('http://localhost:3001/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'persist-test',
        content: input,
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    let agentText = ''

    // Add empty agent message first
    setMessages(prev => [...prev, { role: 'agent', content: '' }])

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      const chunk = decoder.decode(value)
      agentText += chunk

      setMessages(prev => {
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

      <div style={{ minHeight: 300, marginBottom: 20 }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.role === 'user' ? 'You' : 'Agent'}:</strong>{' '}
            {msg.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}
