import { DeviceEventEmitter, Platform as RNPlatForm } from 'react-native';

// statuses:
// offline
// connecting
// online

let webSocket = null;
let onlineChecker = null;
let lastPing = new Date().getTime();
let session = null;
let wsHostAddress = null;

serializeQS = (obj, prefix) => {
    const str = []; 
    let p;

    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
        let k = prefix ? prefix + '[' + p + ']' : p,
            v = obj[p];
        str.push((v !== null && typeof v === 'object') ?
            serialize(v, k) :
            encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }
    }
    return str.join('&');
};

startChecker = () => {
  if (!session) {
    this.disconnect();
    return;
  } else if (onlineChecker) {
    clearInterval(onlineChecker);
    onlineChecker = null;
  }

  onlineChecker = setInterval(() => {
    const now = new Date().getTime();
    if ((now - lastPing) > 8000) { // 8sec
        console.log('client is now offline');
        this.sendMessage('status:offline');
        webSocket = null;
        this.connectWS();
    }
  }, 8000);
};

sendMessage = (msg) => {
    DeviceEventEmitter.emit('new_msg', msg);
};

connectWS = () => {
    if (webSocket) {
        return;
    } else if (!session) {
        console.log('session not set');
        return;
    } else if (!wsHostAddress) {
        console.log('ws Host not set');
        return;
    }
    
    let webSocketURL = null;
    platform = 'Other';
    if (RNPlatForm.OS === 'ios') {
        platform = 'RNIOS';
    } else if (RNPlatForm.OS === 'android') {
        platform = 'RNAndroid';
    }
    queryString = this.serializeQS({ session, platform });

    webSocketURL = wsHostAddress + '/' + queryString;
    console.log('connectWS::Connecting to: ' + webSocketURL);
    this.sendMessage('status:connecting');

    try {
        webSocket = new WebSocket(webSocketURL);
        webSocket.onopen = (openEvent) => {
            this.onOpenFunc(openEvent);
        };
        webSocket.onclose = (closeEvent) => {
            this.onCloseFunc(closeEvent);
        };
        webSocket.onerror = (errorEvent) => {
            console.log('WebSocket ERROR');
            this.sendMessage('status:offline');
        };
        webSocket.onmessage = (messageEvent) => {
            this.onMessageFunc(messageEvent);
        };

    } catch (exception) {
        console.error(exception);
    }
};

disconnect = () => {
    session = null;
    if (webSocket) {
        if (onlineChecker) {
            clearInterval(onlineChecker);
            onlineChecker = null;
        }
        webSocket.close();
        webSocket = null;
    }
};

onCloseFunc = (closeEvent) => {
    console.log('WebSocket CLOSE');
    this.sendMessage('status:offline');
    if (!onlineChecker) {
      this.startChecker();
    }
};

onOpenFunc = (openEvent) => {
  console.log('WebSocket OPEN');
  this.sendMessage('status:online');
  if (!onlineChecker) {
    this.startChecker();
  }
};

onMessageFunc = (messageEvent) => {
    try {
        let wsMsg = messageEvent.data;

        if (wsMsg === 'pi') { // if it's ping
            webSocket.send('po'); // say pong
            lastPing = new Date().getTime();
            return;
        }

        this.sendMessage(wsMsg);
        // send message delivery to server
        wsMsg = JSON.parse(wsMsg);
        webSocket.send(JSON.stringify({
            MsgDT: { MsgType: 1, Data: { _id: wsMsg._id } },
            SeId: session,
            ReId: '0'
        }));
    } catch (error) {} // sometimes connection brokes before sending messages - take it easy or check error.
};

exports.connectWebSocketJS = (wsHost, ses) => {
    session = ses;
    wsHostAddress = wsHost;
    this.connectWS();
};

exports.disConnectWebSocketJS = () => {
    this.disconnect();
};
