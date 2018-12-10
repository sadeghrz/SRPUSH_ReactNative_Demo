import Foundation
import Starscream
import SwiftyJSON

@objc(wsConnectionHandler)
class wsConnectionHandler: RCTEventEmitter {
  
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  override func supportedEvents() -> [String]! {
    return ["new_msg"]
  }
  
  @objc func addEvent(_ name: String) -> Int {
    NSLog("%@", name);
    return 58;
  }
  
  var socket : WebSocket!
  var onlineCheckerTimer: Timer? = nil;
  var lastPingDate: Date = Date();
  var hostname: String = "";
  var session: String = "";
  
  @objc func onlineChecker() {
    print(lastPingDate.timeIntervalSinceNow);
    if (lastPingDate.timeIntervalSinceNow < -8) {
      self.sendEvent(withName: "new_msg", body: "status:reConnecting...")
      connect(host: hostname, sess: session)
    }
  }
  
  func connect(host: String!, sess: String!) {
    self.sendEvent(withName: "new_msg", body: "status:connecting...")
    if (onlineCheckerTimer == nil) {
      self.sendEvent(withName: "new_msg", body: "status:isnilllll...")
      DispatchQueue.main.async(execute: {
        self.onlineCheckerTimer = Timer.scheduledTimer(timeInterval: 8,
                             target: self,
                             selector: #selector(self.onlineChecker),
                             userInfo: nil,
                             repeats: true)
      })
    }
    
    hostname = host;
    session = sess;
    
    var request = URLRequest(url: URL(string: hostname)!);
    request.setValue(session, forHTTPHeaderField: "session");
    request.setValue("IOS", forHTTPHeaderField: "Platform");
    socket = WebSocket(request: request);
    
    socket.onConnect = {
      self.sendEvent(withName: "new_msg", body: "status:connected")
    }
    
    socket.onDisconnect = { (error: Error?) in
      self.sendEvent(withName: "new_msg", body: "status:disConnected")
    }
    
    socket.onText = { (text: String) in
      if (text == "pi") {
        self.socket.write(string: "po");
        self.lastPingDate = Date();
        return;
      }
      
      let jsonMessage = JSON.init(parseJSON: text);
      let _id = jsonMessage["_id"].stringValue;
      if (_id.count > 0) {
        self.socket.write(string: """
          {
          "SeId": "\(self.session)",
          "ReId": "0",
          "MsgDT": { "MsgType": 1, "Data": { "_id": "\(_id)"} }
          }
          """);
        
      }
      
      self.sendEvent(withName: "new_msg", body: text)
    }
    
    socket.respondToPingWithPong = false
    socket.connect();
  }
  
  @objc func connect(_ hostAddress: String, sess: String) {
    session = sess;
    hostname = hostAddress;
    connect(host: hostname, sess: session)
  }
  
  @objc func disconnect() {
    onlineCheckerTimer?.invalidate();
    onlineCheckerTimer = nil;
    socket.disconnect();
  }
}
