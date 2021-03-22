import React from 'react';
import { useParams } from "react-router-dom";
import { Trans } from 'react-i18next';

function DemoHome() {
    const { merchant } = useParams();

    return (
        <div className="App">
            {merchant}
            <Trans>TEST_TRANSLATE</Trans>
        </div>
    );
}

export default DemoHome;
