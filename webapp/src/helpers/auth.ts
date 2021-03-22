import FirebaseOps from './firebaseOps';
import Firebase from 'firebase/app'


export enum AuthProvider {
    google,
    facebook
}

export default class AuthHelper {
    static async signIn() {
        const provider = new Firebase.auth.GoogleAuthProvider()

        return await FirebaseOps.auth
            .signInWithRedirect(provider);
    }

    static async signOut() {
        await FirebaseOps.auth.signOut();
    }
}