import React from "react";
import { isEmpty } from 'helpers/core';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useTranslation } from 'react-i18next';

type ContextProps = {
    operationApproval: (
        dialogTitle: string,
        dialogText: string,
        operation: () => void) => void
};

const OperationApprovalContext = React.createContext<Partial<ContextProps>>({});

export function useOperationApprovalContext(): Partial<ContextProps> {
    const context = React.useContext(OperationApprovalContext);
    if (isEmpty(context)) {
        throw new Error('Context must be used within a Provider')
    }
    return context;
}

interface RequestProps {
    onClick: () => void,
    dialogTitle: string,
    dialogText: string
}

export const OperationApprovalProvider = ({ children }: { children: any }) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const [requestProps, setRequestProps] = React.useState<RequestProps>({
        onClick: null,
        dialogTitle: '',
        dialogText: ''
    })

    const operationApproval = (
        dialogTitle: string,
        dialogText: string,
        operation: () => void) => {
        setRequestProps({
            dialogText,
            dialogTitle,
            onClick: operation
        })
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const agree = () => {
        setOpen(false);
        requestProps.onClick();
    }

    return (
        <OperationApprovalContext.Provider
            value={{
                operationApproval
            }}>

            {children}

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {t(requestProps.dialogTitle)}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t(requestProps.dialogText)}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">
                        {t('NO')}
                    </Button>
                    <Button onClick={agree} variant="contained" color="secondary" autoFocus>
                        {t('YES')}
                    </Button>
                </DialogActions>
            </Dialog>
        </OperationApprovalContext.Provider>
    );
}