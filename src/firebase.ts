import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence benign internal gRPC/WebChannel idle stream disconnect warnings
setLogLevel('silent');

// Prevent benign internal Firestore idle stream timeout warnings from polluting console.error
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args.map(a => (typeof a === 'string' ? a : (a instanceof Error ? a.message : String(a || '')))).join(' ');
    if (msg.includes('Disconnecting idle stream') || msg.includes('Timed out waiting for new targets') || msg.includes('GrpcConnection RPC')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Resilient Firestore initialization using HTTP Long Polling to avoid stream drops
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
