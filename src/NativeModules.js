import { NativeModules } from 'react-native';

export const connectService = (host, session) => {
    //console.log(NativeModules.Service.connect());
    NativeModules.Service.connect(host, session);
};

export const disconnectService = () => {
    NativeModules.Service.disconnect();
};
