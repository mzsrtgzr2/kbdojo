import firebase from 'firebase';
import settings from 'settings/firebase';
import { Get, List, Insert, Remove, Update } from 'types/db';


export default class FirebaseOps {
  /**
   * @returns firebase instance
   */

  static init() {
    firebase.initializeApp(settings);
    return firebase;
  }

  static get firestore(): firebase.firestore.Firestore {
    return firebase.firestore();
  }

  static get functions(): firebase.functions.Functions {
    return firebase.functions();
  }

  static get auth(): firebase.auth.Auth {
    return firebase.auth();
  }

  static get storage(): firebase.storage.Storage {
    return firebase.storage();
  }

  static close() {
    firebase.database().goOffline()
  }

  static async get({ collection, id }: Get) {
    const doc = await FirebaseOps.firestore
      .collection(collection)
      .doc(id).get();
    return doc.data();
  }

  static list({ collection, where }: List) {

    const q = FirebaseOps.firestore
      .collection(collection);

    if (where) {
      return q.where(
        where.el1,
        where.op as firebase.firestore.WhereFilterOp,
        where.el2).get();
    }
    return q.get();
  }

  static insert({ collection, payload }: Insert) {
    return FirebaseOps.firestore
      .collection(collection)
      .add(payload);
  }
  static remove({ collection, id }: Remove) {
    return FirebaseOps.firestore
      .collection(collection)
      .doc(id)
      .delete();
  }
  static update({ collection, id, payload }: Update) {
    return FirebaseOps.firestore
      .collection(collection)
      .doc(id)
      .update(payload);
  }

  static call(funcName: string, params: any)
    : Promise<firebase.functions.HttpsCallableResult> {
    return FirebaseOps.functions.httpsCallable(funcName)(params);
  }
}
