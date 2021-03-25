import FirebaseOps from './firebaseOps';
import Firebase from 'firebase/app'


export enum AuthProvider {
    google,
    facebook
}

export default class AuthHelper {
    static async signIn() {
        const provider = new Firebase.auth.GoogleAuthProvider()

        return FirebaseOps.auth
            .signInWithRedirect(provider);
    }
    static async signInGoogle() {
        const provider = new Firebase.auth.GoogleAuthProvider()
        return await FirebaseOps.auth.signInWithPopup(provider);
        
    }

    static async signInFacebook() {
        const provider = new Firebase.auth.FacebookAuthProvider()
        return await FirebaseOps.auth.signInWithPopup(provider);
    }

    static async signInAnonymous() {
        return await FirebaseOps.auth.signInAnonymously();
    }

    static async signOut() {
        await FirebaseOps.auth.signOut();
    }
}