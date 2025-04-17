  // firebaseUploader.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// TODO: Replace with your config
const firebaseConfig = {
    apiKey: "AIzaSyC_GknCorE0goHp-bDUqySS7-BmrjONXE8",
    authDomain: "ceylonvibes.firebaseapp.com",
    projectId: "ceylonvibes",
    storageBucket: "ceylonvibes.appspot.com",
    messagingSenderId: "804091201630",
    appId: "1:804091201630:web:234dbd999f20e197c78ccf",};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const uploadImageToFirebase = async (file) => {
  const fileRef = ref(storage, `images/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};
