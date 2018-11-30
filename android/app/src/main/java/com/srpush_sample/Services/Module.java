package com.srpush_sample.Services;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.Settings;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import static android.content.Context.MODE_PRIVATE;

public class Module extends ReactContextBaseJavaModule {

    private static ReactApplicationContext RAC;

    public Module(ReactApplicationContext reactContext) {
        super(reactContext);
        RAC = reactContext;
    }

    @Override
    public String getName() {
        return "Service";
    }

    @ReactMethod
    public void connect(String host, String session) {
        Intent appService = new Intent(RAC, AppService.class);

        SharedPreferences.Editor editor = RAC
                .getSharedPreferences("authPrefrence", MODE_PRIVATE).edit();
        editor.putString("session", session);
        editor.putString("host", host);
        editor.apply();

        RAC.startService(appService);
    }

    @ReactMethod
    public void disconnect() {
        Intent appService = new Intent(RAC, AppService.class);

        SharedPreferences.Editor editor = RAC
                .getSharedPreferences("authPrefrence", MODE_PRIVATE).edit();
        editor.clear();
        editor.apply();

        RAC.stopService(appService);
    }

    public static void sendEvent(String eventName,
                                 @Nullable Object params) {
        if (RAC != null) {
            RAC.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        }
    }
}
