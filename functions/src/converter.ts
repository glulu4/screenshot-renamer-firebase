import {FirestoreDataConverter} from "firebase-admin/firestore";
import {firestore} from "firebase-admin";
import {initializeApp} from "firebase-admin/app";
import {UserDevice} from "./types";
// import {logger} from "firebase-functions/v1";
// import * as functions from "firebase-functions";
initializeApp();

const converter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: T): FirebaseFirestore.DocumentData => {
    return data as unknown as FirebaseFirestore.DocumentData;
  },
  fromFirestore: (
    snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T,
});
const dataPoint = <T>(collectionPath: string) =>
  firestore().collection(collectionPath).withConverter(converter<T>());

const db = {
  firestore: firestore(),
  users: dataPoint<UserDevice>("UserDevice"),

};

export default db;
