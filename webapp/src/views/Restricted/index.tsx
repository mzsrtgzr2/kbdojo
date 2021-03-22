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
            <Typography className="restrictedTypography" variant="h5" >
                {t('RESTRICTED_TO_STORE_OWNER')}
            </Typography>

            <p className="restrictedActions">
                <Button
                    variant="contained"
                    color="primary"
                    component={Link} to="/demo_auth">
                    {t('REDIRECT_TO_AUTH')}
                </Button>
            </p>

        </Grid>
    );
}
