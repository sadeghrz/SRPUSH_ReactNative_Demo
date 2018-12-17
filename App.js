/* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import axios from 'axios';
import { Text, View, Button, DeviceEventEmitter, NativeModules, NativeEventEmitter, Alert } from 'react-native';
import { connectService, disconnectService } from './src/NativeModules';
import { connectWebSocketJS, disConnectWebSocketJS } from './src/webSocketJS';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.CounterEvents = new NativeEventEmitter(NativeModules.Service);
    this.Username = 'testcom1';
    this.SoPass = '641b788bcd0fd46eed0f41870a5fc804560f7fba';
    //this.apiHost = 'https://testcom1.srpush.ir:2021/api/createSession';
    this.apiHost = 'http://192.168.1.100:9779/api/createSession';
    //this.wsHost = 'wss://testcom1.srpush.ir:2020';
    this.wsHost = 'ws://192.168.1.100:9780';
    this.clientUserID = 'DRIVER_146';
    this.sessionTimeout = 0; // expire session after this seconds

    this.state = {
      status: 'status here',
      messages: 'messages here',
      session: null
    };
  }

  componentWillMount() {
    // for receive events from Android native code
    DeviceEventEmitter.addListener('new_msg', this.setOnNewCBMessage);

    // for receive events from IOS native code
    this.CounterEvents.addListener('new_msg', this.setOnNewCBMessage);
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('new_msg', this.setOnNewCBMessage);
    this.CounterEvents.removeListener('new_msg', this.setOnNewCBMessage);
  }

  setOnNewCBMessage = (newMsg) => {
    if (newMsg && newMsg.indexOf('status:') > -1) {
      return this.setState({ status: newMsg });  
    }
    console.log('new message recieved');
    this.setState({ messages: newMsg });
  }

  getSession() {
    axios.post(
      this.apiHost,
      { uid: this.clientUserID, ExTime: this.sessionTimeout },
      {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: 'Basic'
        },
        auth: {
            username: this.Username,
            password: this.SoPass
        },
        timeout: 20000
      }
    )
    .then(res => { res && res.data ? this.setState({ session: res.data }) : Alert.alert(null, String(res)); })
    .catch((error) => Alert.alert(null, String(error)));
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#F5FCFF' }}>
        <View style={{ marginTop: 40 }}>
          <Button title={'Get/Set session'} onPress={() => this.getSession()} />
        </View>
        <Text style={{ fontSize: 17, marginTop: 20 }}>{this.state.session || 'session not set'}</Text>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', marginTop: 30 }}>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Button title={'Connect from nativeCode'} onPress={() => { this.state.session ? connectService(this.wsHost, this.state.session) : Alert.alert(null, 'session not set'); }} />
          </View>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Button title={'DisConnect'} onPress={() => disconnectService()} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', marginTop: 50 }}>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Button title={'Connect from JSCode'} onPress={() => { this.state.session ? connectWebSocketJS(this.wsHost, this.state.session) : Alert.alert(null, 'session not set'); }} />
          </View>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Button title={'DisConnect'} onPress={() => disConnectWebSocketJS()} />
          </View>
        </View>
        <Text style={{ width: '95%', alignSelf: 'center', textAlign: 'center', marginTop: 20, fontSize: 25 }}>{this.state.status}</Text>
        <Text numberOfLines={10} style={{ width: '95%', alignSelf: 'center', textAlign: 'center', marginTop: 20 }}>{this.state.messages}</Text>
      </View>
    );
  }
}
