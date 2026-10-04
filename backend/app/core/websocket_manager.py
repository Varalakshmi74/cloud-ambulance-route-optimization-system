import json
from typing import List, Dict, Any
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.channel_subscribers: Dict[str, List[WebSocket]] = {
            "all": [],
            "driver": [],
            "hospital": [],
            "admin": [],
            "patient": []
        }

    async def connect(self, websocket: WebSocket, channel: str = "all"):
        await websocket.accept()
        self.active_connections.append(websocket)
        if channel in self.channel_subscribers:
            self.channel_subscribers[channel].append(websocket)
        else:
            self.channel_subscribers["all"].append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        for channel, conns in self.channel_subscribers.items():
            if websocket in conns:
                conns.remove(websocket)

    async def broadcast_json(self, data: Dict[str, Any], channel: str = "all"):
        """
        Broadcast message to all subscribers of a specific channel or entire pool.
        """
        message_str = json.dumps(data)
        targets = self.active_connections if channel == "all" else self.channel_subscribers.get(channel, self.active_connections)
        
        dead_connections = []
        for connection in targets:
            try:
                await connection.send_text(message_str)
            except Exception:
                dead_connections.append(connection)
                
        for dead in dead_connections:
            self.disconnect(dead)

manager = WebSocketManager()
