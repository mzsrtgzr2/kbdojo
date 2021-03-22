import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';

import i18n from "i18n";
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@material-ui/core/styles';
import { useStoreContext } from 'state/StoreProvider';

// Configure JSS
const jss = create({ plugins: [...jssPreset().plugins, rtl()] });


interface Props {
    children: React.ReactNode
}
export default function ({ children }: Props) {
    /**
     * This controler the Direction and Language of the theme
     * - change direction
     * - change i18n selected language when store selected
     */

    const { store } = useStoreContext();

    // needs something more sofisticated later to decide direction
    const getDirection = (): 'rtl' | 'ltr' =>
        ((!!store && store.i18n) === 'he' ? 'rtl' : 'ltr');

    React.useEffect(() => {
        if (!!store) {
            console.log('changing language to', store.i18n);
            i18n.changeLanguage(store.i18n);
        }
    }, [store])

    return (
        <StylesProvider jss={jss}>
            <ThemeProvider theme={{ direction: getDirection() }}>
                <div dir={getDirection()}>
                    {children}
                </div>
            </ThemeProvider>
        </StylesProvider>
    );
}
