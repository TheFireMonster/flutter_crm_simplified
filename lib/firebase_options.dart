 
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;


class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBBw6TrXiljptA4ZekEJuMfoWm2pv7ApC0',
    appId: '1:860258832462:web:df1fa45368079e48b3f31f',
    messagingSenderId: '860258832462',
    projectId: 'smart-crm-firebase',
    authDomain: 'smart-crm-firebase.firebaseapp.com',
    storageBucket: 'smart-crm-firebase.firebasestorage.app',
    measurementId: 'G-G566261H73',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBQZvXMEjDQ7B1UO4BKSsaNHPEKnImaNKw',
    appId: '1:860258832462:android:5f8467e657c2b0afb3f31f',
    messagingSenderId: '860258832462',
    projectId: 'smart-crm-firebase',
    storageBucket: 'smart-crm-firebase.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyD4WK84w_ldX8mrDkXrEfHy0l3EIJlSXmk',
    appId: '1:860258832462:ios:f75a29f8f29f4d8db3f31f',
    messagingSenderId: '860258832462',
    projectId: 'smart-crm-firebase',
    storageBucket: 'smart-crm-firebase.firebasestorage.app',
    iosClientId: '860258832462-3j9s74n75sm48uk93q0vii9knlevtgin.apps.googleusercontent.com',
    iosBundleId: 'com.example.flutterCrm',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyD4WK84w_ldX8mrDkXrEfHy0l3EIJlSXmk',
    appId: '1:860258832462:ios:f75a29f8f29f4d8db3f31f',
    messagingSenderId: '860258832462',
    projectId: 'smart-crm-firebase',
    storageBucket: 'smart-crm-firebase.firebasestorage.app',
    iosClientId: '860258832462-3j9s74n75sm48uk93q0vii9knlevtgin.apps.googleusercontent.com',
    iosBundleId: 'com.example.flutterCrm',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyBBw6TrXiljptA4ZekEJuMfoWm2pv7ApC0',
    appId: '1:860258832462:web:4ff29314ef62b544b3f31f',
    messagingSenderId: '860258832462',
    projectId: 'smart-crm-firebase',
    authDomain: 'smart-crm-firebase.firebaseapp.com',
    storageBucket: 'smart-crm-firebase.firebasestorage.app',
    measurementId: 'G-0FY0WKRQ2J',
  );

}