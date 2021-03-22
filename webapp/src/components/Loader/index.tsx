import React from 'react';
import {
    CircularProgress,
    Typography,
} from '@material-ui/core';
import './loader.css';
import { useTranslation } from 'react-i18next';

export default function ({ label }: { label: string }) {
    const { t } = useTranslation();

    const renderLoader = () => (
        <React.Fragment>
            <CircularProgress />
            <Typography className="loaderTypography" variant="h5" >
                {t(label)}</Typography>
        </React.Fragment>
    );

    return renderLoader();

}
