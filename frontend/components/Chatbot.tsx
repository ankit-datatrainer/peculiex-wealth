"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
  link?: string;
};

const KNOWLEDGE_BASE = [
  { label: "Mutual Funds", keywords: ["mutual fund", "mutual firm"], text: "We offer expert guidance on Mutual Funds. Would you like to explore our Mutual Funds page?", link: "/products/mutual-funds" },
  { label: "Unlisted Shares", keywords: ["unlisted", "pre-ipo", "pre ipo"], text: "Discover private market opportunities through our Unlisted Shares. Want to see available shares?", link: "/unlisted" },
  { label: "PMS", keywords: ["pms", "portfolio management"], text: "We provide Portfolio Management Services (PMS). Check out our PMS page for more details.", link: "/products/pms" },
  { label: "AIF", keywords: ["aif", "alternative investment"], text: "Explore Alternative Investment Funds (AIF) curated by our experts. View the AIF page?", link: "/products/aif" },
  { label: "Fixed Deposits", keywords: ["fd", "fixed deposit"], text: "Secure your capital with Corporate FDs. Would you like to know more?", link: "/products/fixed-deposits" },
  { label: "Bonds", keywords: ["bond"], text: "Invest in high-yield bonds for regular income. Visit our Bonds section?", link: "/products/bonds" },
  { label: "Insurance", keywords: ["insurance", "health", "life"], text: "Protect your wealth and health with our Insurance products. Check them out here.", link: "/products/insurance" },
];

const INITIAL_MESSAGE: Message = { 
  id: 1, 
  text: "Hi! I am the Peculiex AI Assistant. Ask me about our investment products like Mutual Funds, Unlisted Shares, Bonds, or PMS.", 
  sender: "bot" 
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("peculiex_chatbot_messages");
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("peculiex_chatbot_messages", JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
    scrollToBottom();
  }, [messages, open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const processQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = { id: Date.now(), text: queryText.trim(), sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    
    const query = queryText.toLowerCase();

    // Simple predefined search
    let found = false;
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(kw => query.includes(kw)) || query === item.label.toLowerCase()) {
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), text: item.text, sender: "bot", link: item.link }]);
        }, 500);
        found = true;
        break;
      }
    }

    if (!found) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: "I'm sorry, I couldn't find information about that. Try asking about mutual funds, unlisted shares, or bonds.", sender: "bot" }]);
      }, 500);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processQuery(input);
    setInput("");
  };

  const handleLinkClick = (link: string) => {
    setOpen(false);
    router.push(link);
  };

  return (
    <div className="chatbot-root">
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h4>Peculiex AI</h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                className="chatbot-clear-btn" 
                onClick={() => setMessages([INITIAL_MESSAGE])}
                title="Clear chat history"
                style={{ background: "none", border: "none", color: "var(--color-text-faint)", cursor: "pointer", fontSize: "14px" }}
              >
                Clear
              </button>
              <button className="chatbot-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
            </div>
          </div>
          <div className="chatbot-messages">
            {messages.map((m) => (
              <div key={m.id} className={`chatbot-message ${m.sender}`}>
                <p className="chatbot-msg-text">{m.text}</p>
                {m.link && (
                  <button className="chatbot-link-btn" onClick={() => handleLinkClick(m.link!)}>
                    Explore Option →
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-options">
            {KNOWLEDGE_BASE.map(item => (
              <button 
                key={item.label} 
                className="chatbot-option-pill"
                onClick={() => processQuery(item.label)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      
      {!open && (
        <button className="chatbot-toggle" onClick={() => setOpen(true)} aria-label="Open AI Chat">
          <span className="chatbot-toggle-icon">✨</span>
          <span className="chatbot-toggle-text">Ask AI</span>
        </button>
      )}
    </div>
  );
}
