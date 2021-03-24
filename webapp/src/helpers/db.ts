import firebase from 'firebase';
import firebaseOps from './firebaseOps';
import { Get, List, Insert, Remove, Update } from 'types/db';

export default class {
    /**
     * @returns db instance
     */
    static init() {
        return firebaseOps.init();
    }
    
    static close() {
        firebaseOps.close();
    }

    static get(get: Get) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await firebaseOps.get(get));
            } catch (err) {
                reject(err);
            }
        });
    }

    static list(list: List) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await firebaseOps.list(list));
            } catch (err) {
                reject(err);
            }
        });
    }

    static insert(insert: Insert) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await firebaseOps.insert(insert));
            } catch (err) {
                reject(err);
            }
        });
    }
    static remove(remove: Remove) {
        return new Promise(async (resolve, reject) => {
            try {
                await firebaseOps.remove(remove);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
    static update(update: Update) {
        return new Promise(async (resolve, reject) => {
            try {
                await firebaseOps.update(update);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    static call(name: string, params: any)
        : Promise<firebase.functions.HttpsCallableResult> {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await firebaseOps.call(name, params));
            } catch (err) {
                reject(err);
            }
        });
    }
}
