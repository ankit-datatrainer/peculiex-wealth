const { WebSocketServer } = require("ws");

let wss = null;

function initWSS(server) {
  wss = new WebSocketServer({ server });
  
  wss.on("connection", (ws) => {
    console.log("[ws] Client connected");
    ws.activeSymbols = new Set();
    
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.action === "subscribe" && Array.isArray(msg.symbols)) {
          msg.symbols.forEach(s => ws.activeSymbols.add(s));
        }
        if (msg.action === "unsubscribe" && Array.isArray(msg.symbols)) {
          msg.symbols.forEach(s => ws.activeSymbols.delete(s));
        }
      } catch(e) {}
    });

    ws.on("close", () => {
      console.log("[ws] Client disconnected");
    });
  });
}

function broadcast(type, payload) {
  if (!wss) return;
  const data = JSON.stringify({ type, payload });
  for (const client of wss.clients) {
    if (client.readyState === 1) { // 1 = OPEN
      // If payload has a symbol, only send to clients who subscribed
      if (payload && payload.symbol) {
        if (!client.activeSymbols || !client.activeSymbols.has(payload.symbol)) {
          continue; 
        }
      }
      client.send(data);
    }
  }
}

function getActiveSymbols() {
  const set = new Set();
  if (wss) {
    for (const client of wss.clients) {
      if (client.activeSymbols) {
        client.activeSymbols.forEach(s => set.add(s));
      }
    }
  }
  return Array.from(set);
}

module.exports = { initWSS, broadcast, getActiveSymbols };
