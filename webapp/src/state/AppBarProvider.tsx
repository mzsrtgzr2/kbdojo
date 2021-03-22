import React, { useState } from "react";
import { isEmpty } from 'helpers/core';

type ContextProps = {
    appBarTitle: string,
    setAppBarTitle: (a: string) => void,
    appBarRightSide: React.ReactNode,
    setAppBarRightSide: (a: React.ReactNode) => void
};

const AppBarContext = React.createContext<Partial<ContextProps>>({});

export function useAppBarContext(): Partial<ContextProps> {
    const context = React.useContext(AppBarContext);
    if (isEmpty(context)) {
        throw new Error('Context must be used within a Provider')
    }
    return context;
}

export const AppBarProvider = ({ children }: { children: any }) => {
    const [appBarTitle, setAppBarTitle] = useState<string>('');
    const [appBarRightSide, setAppBarRightSide] = useState<React.ReactNode | null>(null);

    return (
        <AppBarContext.Provider
            value={{
                appBarTitle,
                setAppBarTitle,
                appBarRightSide,
                setAppBarRightSide
            }}>
            {children}
        </AppBarContext.Provider>
    );
}