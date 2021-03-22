import React from 'react';
import {
    Grid,
    Button,
    Typography,
} from '@material-ui/core';
import { Security } from '@material-ui/icons';
import './error.css';
import { useTranslation } from 'react-i18next';
import { useHistory } from "react-router-dom";


export default function () {
    const { t } = useTranslation();

    const history = useHistory();


    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
            className="restrictedContainer">

            <Security fontSize="large" />
            <Typography className="restrictedTypography" variant="h5" >
                {t('ERROR')}
            </Typography>

            <p className="restrictedActions">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={history.goBack}>
                    {t('BACK')}
                </Button>
            </p>

        </Grid>
    );
}
