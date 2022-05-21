import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  getDocs,
  Firestore,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore/lite";
import { Service, Subscription } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyAUEr1qni9X-pcb5XzAEXjAUfshS2605wc",
  authDomain: "lasso-d755a.firebaseapp.com",
  projectId: "lasso-d755a",
  storageBucket: "lasso-d755a.appspot.com",
  messagingSenderId: "507735827199",
  appId: "1:507735827199:web:e37288ddaca924c486a2ca",
  measurementId: "G-011TVSX6QV",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
// const analytics: Analytics = getAnalytics(app);

export async function getServices(address: string) {
  const subscriptionsCol = collection(db, "services");
  const subscriptionsSnapshot = await getDocs(subscriptionsCol);
  const subscriptionList = subscriptionsSnapshot.docs.map((doc) => doc.data());

  return subscriptionList.filter(
    (subscription) => subscription["owner"] === address
  );
}

export async function getService(id: string) {
  const docRef = doc(db, "services", id);
  const docSnap = await getDoc(docRef);
  console.log(docSnap);
  return docSnap.data();
}

export async function createService(service: Service) {
  const docRef = await addDoc(collection(db, "services"), service);
  return docRef.id;
}

export async function updateService(
  subscriptionId: string,
  updatedValues: Partial<Service>
) {
  const docRef = doc(db, "services", subscriptionId);
  try {
    await updateDoc(docRef, updatedValues);
    return true;
  } catch (e: any) {
    console.log("Error updating subscription");
    return false;
  }
}

export async function deleteService(subscriptionId: string) {
  try {
    await deleteDoc(doc(db, "subscriptions", subscriptionId));
    return true;
  } catch (e: any) {
    console.log("Error deleting service");
    return false;
  }
}

export async function getSubscriptions(address: string) {
  const subscriptionsCol = collection(db, "subscriptions");
  const subscriptionsSnapshot = await getDocs(subscriptionsCol);
  const subscriptionList = subscriptionsSnapshot.docs.map((doc) => doc.data());

  return subscriptionList.filter(
    (subscription) => subscription["subscriber"] === address
  );
}

export async function createSubscription(subscription: Subscription) {
  const docRef = await addDoc(collection(db, "subscriptions"), subscription);
  return docRef.id;
}
