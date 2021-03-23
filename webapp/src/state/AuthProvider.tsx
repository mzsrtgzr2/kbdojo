import React, { useEffect, useState } from "react";
import FirebaseOps from "helpers/firebaseOps";
import { isEmpty } from 'helpers/core';
import { Mixpanel } from 'mixpanel';


type ContextProps = {
    user: firebase.User | null;
    authenticated: boolean;
    setUser: unknown;
    loadingAuthState: boolean;
};
const AuthContext = React.createContext<Partial<ContextProps>>({});

export function useAuthContext(): Partial<ContextProps> {
    const context = React.useContext(AuthContext);
    if (isEmpty(context)) {
        throw new Error('Context must be used within a Provider')
    }
    return context;
}

export const AuthProvider = ({ children }: { children: any }) => {
    const [user, setUser] = useState(null as firebase.User | null);
    const [loadingAuthState, setLoadingAuthState] = useState(true);

    useEffect(() => {
        FirebaseOps.auth.onAuthStateChanged((user: any) => {
            setUser(user);
            Mixpanel.identify(user.email);
            Mixpanel.people.set({
                "$email": user.email,
                "name": user.displayName
              });
            setLoadingAuthState(false);
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                authenticated: user !== null,
                setUser,
                loadingAuthState
            }}>
            {children}
        </AuthContext.Provider>
    );
}