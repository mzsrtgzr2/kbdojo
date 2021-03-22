import React from 'react';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import AuthHelper from 'helpers/auth';
import { useAuthContext } from 'state/AuthProvider'


export default function () {
    const { t } = useTranslation();
    const { authenticated } = useAuthContext();

    const signIn = async () => {
        await AuthHelper.signIn();
    }

    const signOut = async () => {
        await AuthHelper.signOut();
    }

    return (
        <div>
            {!authenticated &&
                <Button onClick={signIn}>{t('SIGNIN')}</Button>}
            {authenticated &&
                <Button onClick={signOut}>{t('SIGNOUT')}</Button>}
        </div>
    );
}