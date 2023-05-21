import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDOze6Pl1ZhafZPIHRrIWx9-ThBsEU16l8",
    authDomain: "stock-crud.firebaseapp.com",
    projectId: "stock-crud",
    storageBucket: "stock-crud.appspot.com",
    messagingSenderId: "139980861119",
    appId: "1:139980861119:web:efd96a470cb1230bc7a00a",
    measurementId: "G-YVGPPRXJ8E"
  };

const app = initializeApp(firebaseConfig);

export default app;


