import React from 'react';
import {
    Grid,
    Button,
    Typography,
} from '@material-ui/core';
import { Security } from '@material-ui/icons';
import './restricted.css';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


export default function () {
    const { t } = useTranslation();

    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
            className="restrictedContainer">

            <Security fontSize="large" />
            <Typography className="restrictedTypography" variant="h3" >
                {t('RESTRICTED')}
            </Typography>


        </Grid>
    );
}
