import React from "react";
import { Store } from "types/entities";
import { CollectionsNames } from 'types/db';
import { isEmpty } from 'helpers/core';
import { FirestoreDocument } from 'react-firestore';

type ContextProps = {
    loadingStoreState: boolean,
    isError: boolean,
    storeId: string,
    store: (Store | null),
    snapshot: firebase.firestore.DocumentSnapshot | null,
    isStoreOwner: (userId: string) => boolean,
    setIsStoreNotDefined: (val: boolean) => void
};
const StoreContext = React.createContext<Partial<ContextProps>>({});

export function useStoreContext(): Partial<ContextProps> {
    const context = React.useContext(StoreContext);
    if (isEmpty(context)) {
        throw new Error('Context must be used within a Provider')
    }
    return context;
}

export const StoreProvider = ({ storeId, children }: { storeId: string, children: any }) => {

    const isStoreOwnerGen = (store: Store | null) => (userId: string): boolean => {
        return !!store && !!store.owners && store.owners.indexOf(userId) >= 0;
    }

    const getStorePath = () => `${CollectionsNames.stores}/${storeId}`;

    return (
        <FirestoreDocument
            path={getStorePath()}
            render={({ isLoading, data, snapshot }) => (
                <StoreContext.Provider
                    value={{
                        loadingStoreState: isLoading,
                        storeId,
                        snapshot,
                        isStoreOwner: isStoreOwnerGen(data),
                        isError: (!isLoading && !data),
                        store: data as Store | null
                    }}>
                    {children}
                </StoreContext.Provider>)
            } />

    );
}