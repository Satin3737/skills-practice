// no need ws package

// client only
// same interface as in the browser websocket api
const ws = new WebSocket('wss://echo.websocket.org');

ws.onopen = () => {
    console.log('WebSocket connection opened');
    ws.send('Hello, WebSocket!');
};

ws.onmessage = event => {
    console.log('Received message:', event.data);
};

ws.onerror = error => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};
