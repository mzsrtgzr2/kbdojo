import React, { useState } from "react";
import { isEmpty } from 'helpers/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { useTranslation } from 'react-i18next';


function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

type ContextProps = {
    toast: (text: string) => void,
};

const ToastContext = React.createContext<Partial<ContextProps>>({});

export function useToastContext(): Partial<ContextProps> {
    const context = React.useContext(ToastContext);
    if (isEmpty(context)) {
        throw new Error('Context must be used within a Provider')
    }
    return context;
}

interface ToastParams {
    text: string
}

export const ToastProvider = ({ children }: { children: any }) => {
    const { t } = useTranslation();
    const [isShowing, setIsShowing] = useState<boolean>(false);
    const [toastParams, setToastParams] = useState<ToastParams>({ text: '' });

    const toast = (text: string) => {
        setToastParams({ text });
        setIsShowing(true);
    };

    const handleClose = () => {
        setIsShowing(false);
    }

    return (
        <ToastContext.Provider
            value={{
                toast
            }}>

            {children}
            <Snackbar open={isShowing} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success">
                    {t(toastParams.text)}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}