"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Link, Folder, Send } from "lucide-react"
import { LiquidMetal, PulsingBorder } from "@paper-design/shaders-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Message } from 'ai'

export function ChatInterface() {
  const [isFocused, setIsFocused] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Determine if chat has started based on messages
  const hasStarted = messages.length > 0

  useEffect(() => {
    console.log('Messages updated:', messages)
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      }

      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          assistantMessage.content += chunk

          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: assistantMessage.content }
                : msg
            )
          )
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as any)
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* STARTER SCREEN - Only visible when no messages */}
      {!hasStarted && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-4xl relative">
            <div className="flex flex-row items-center mb-2">
              {/* Shader Circle */}
              <motion.div
                id="circle-ball"
                className="relative flex items-center justify-center z-10"
                animate={{
                  y: isFocused ? 50 : 0,
                  opacity: isFocused ? 0 : 100,
                  filter: isFocused ? "blur(4px)" : "blur(0px)",
                  rotation: isFocused ? 180 : 0,
                }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <div className="z-10 absolute bg-white/5 h-11 w-11 rounded-full backdrop-blur-[3px]">
                  <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-4 left-4  blur-[1px]" />
                  <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-3 left-7  blur-[0.8px]" />
                  <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-8 left-2  blur-[1px]" />
                  <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-5 left-9 blur-[0.8px]" />
                  <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-7 left-7  blur-[1px]" />
                </div>
                <LiquidMetal
                  style={{ height: 80, width: 80, filter: "blur(14px)", position: "absolute" }}
                  colorBack="hsl(0, 0%, 0%, 0)"
                  colorTint="hsl(29, 77%, 49%)"
                  repetition={4}
                  softness={0.5}
                  shiftRed={0.3}
                  shiftBlue={0.3}
                  distortion={0.1}
                  contour={1}
                  shape="circle"
                  offsetX={0}
                  offsetY={0}
                  scale={0.58}
                  rotation={50}
                  speed={5}
                />
                <LiquidMetal
                  style={{ height: 80, width: 80 }}
                  colorBack="hsl(0, 0%, 0%, 0)"
                  colorTint="hsl(29, 77%, 49%)"
                  repetition={4}
                  softness={0.5}
                  shiftRed={0.3}
                  shiftBlue={0.3}
                  distortion={0.1}
                  contour={1}
                  shape="circle"
                  offsetX={0}
                  offsetY={0}
                  scale={0.58}
                  rotation={50}
                  speed={5}
                />
              </motion.div>

              {/* Greeting Text */}
              <motion.p
                className="text-white/40 text-sm font-light z-10"
                animate={{
                  y: isFocused ? 50 : 0,
                  opacity: isFocused ? 0 : 100,
                  filter: isFocused ? "blur(4px)" : "blur(0px)",
                }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                Hey there! I'm here to help with anything you need
              </motion.p>
            </div>

            <form onSubmit={onSubmit}>
              <div className="relative">
                <motion.div
                  className="absolute w-full h-full z-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isFocused ? 1 : 0 }}
                  transition={{
                    duration: 0.8,
                  }}
                >
                  <PulsingBorder
                    style={{ height: "146.5%", minWidth: "143%" }}
                    colorBack="hsl(0, 0%, 0%)"
                    roundness={0.18}
                    thickness={0}
                    softness={0}
                    intensity={0.3}
                    bloom={2}
                    spots={2}
                    spotSize={0.25}
                    pulse={0}
                    smoke={0.35}
                    smokeSize={0.4}
                    scale={0.7}
                    rotation={0}
                    offsetX={0}
                    offsetY={0}
                    speed={1}
                    colors={[
                      "hsl(29, 70%, 37%)",
                      "hsl(32, 100%, 83%)",
                      "hsl(4, 32%, 30%)",
                      "hsl(25, 60%, 50%)",
                      "hsl(0, 100%, 10%)",
                    ]}
                  />
                </motion.div>

                <motion.div
                  className="relative bg-[#040404] rounded-2xl p-4 z-10"
                  animate={{
                    borderColor: isFocused ? "#BA9465" : "#3D3D3D",
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.1,
                  }}
                  style={{
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                >
                  {/* Message Input - Using the shared input state */}
                  <div className="relative mb-6">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about acne scar treatments, pricing, or book a consultation..."
                      className="min-h-[80px] resize-none bg-transparent border-none text-white text-base placeholder:text-zinc-500 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none [&:focus]:ring-0 [&:focus]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:outline-none"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Left side icons */}
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white p-0"
                      >
                        <Brain className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-0"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      {/* Center model selector */}
                      <div className="flex items-center">
                        <Select defaultValue="gpt-4">
                          <SelectTrigger className="bg-zinc-900 border-[#3D3D3D] text-white hover:bg-zinc-700 text-xs rounded-full px-2 h-8 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">⚡</span>
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 z-30 border-[#3D3D3D] rounded-xl z-30">
                            <SelectItem value="gpt-4" className="text-white hover:bg-zinc-700 rounded-lg">
                              GPT-4 Turbo
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Right side icons */}
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-0"
                      >
                        <Folder className="h-5 w-5" />
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!input.trim() || isLoading}
                        className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white p-0 disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHAT SCREEN - Visible when messages exist */}
      {hasStarted && (
        <>
          {/* Messages Container - Flows above input */}
          <div className="flex-1 overflow-y-auto pb-[200px]">
            <div className="max-w-4xl mx-auto px-4 pt-8">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`mb-6 flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-orange-600/20 text-white border border-orange-600/30'
                          : 'bg-zinc-900 text-white border border-zinc-800'
                      }`}
                    >
                      <div className="text-xs text-zinc-400 mb-1">
                        {message.role === 'user' ? 'You' : 'Dr. Emer AI'}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-6"
                >
                  <div className="bg-zinc-900 text-white border border-zinc-800 px-4 py-3 rounded-2xl">
                    <div className="text-xs text-zinc-400 mb-1">Dr. Emer AI</div>
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Input Container at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900">
            <div className="max-w-4xl mx-auto p-4">
              <form onSubmit={onSubmit}>
                <div className="relative">
                  <motion.div
                    className="absolute w-full h-full z-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <PulsingBorder
                      style={{ height: "146.5%", minWidth: "143%" }}
                      colorBack="hsl(0, 0%, 0%)"
                      roundness={0.18}
                      thickness={0}
                      softness={0}
                      intensity={0.3}
                      bloom={2}
                      spots={2}
                      spotSize={0.25}
                      pulse={0}
                      smoke={0.35}
                      smokeSize={0.4}
                      scale={0.7}
                      rotation={0}
                      offsetX={0}
                      offsetY={0}
                      speed={1}
                      colors={[
                        "hsl(29, 70%, 37%)",
                        "hsl(32, 100%, 83%)",
                        "hsl(4, 32%, 30%)",
                        "hsl(25, 60%, 50%)",
                        "hsl(0, 100%, 10%)",
                      ]}
                    />
                  </motion.div>

                  <motion.div
                    className="relative bg-[#040404] rounded-2xl p-4 z-10"
                    animate={{
                      borderColor: isFocused ? "#BA9465" : "#3D3D3D",
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1,
                    }}
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                    }}
                  >
                    {/* Message Input */}
                    <div className="relative mb-4">
                      <Textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Continue the conversation..."
                        className="min-h-[60px] max-h-[120px] resize-none bg-transparent border-none text-white text-base placeholder:text-zinc-500 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none [&:focus]:ring-0 [&:focus]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:outline-none"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Left side icons */}
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white p-0"
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-0"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        {/* Model selector */}
                        <div className="flex items-center">
                          <Select defaultValue="gpt-4">
                            <SelectTrigger className="bg-zinc-900 border-[#3D3D3D] text-white hover:bg-zinc-700 text-xs rounded-full px-2 h-8 min-w-[150px]">
                              <div className="flex items-center gap-2">
                                <span className="text-xs">⚡</span>
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 z-30 border-[#3D3D3D] rounded-xl">
                              <SelectItem value="gpt-4" className="text-white hover:bg-zinc-700 rounded-lg">
                                GPT-4 Turbo
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Right side icons */}
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-0"
                        >
                          <Folder className="h-5 w-5" />
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isLoading || !input.trim()}
                          className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}