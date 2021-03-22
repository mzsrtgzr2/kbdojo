import React from 'react';
import {
    Grid,
} from '@material-ui/core';
import './loader.css';
import Loader from 'components/Loader';

export default function () {
    const renderLoader = () => (
        <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
            className="loaderContainer">
            <Loader label="LOADER_PAGE_LABEL" />
        </Grid>
    );

    return renderLoader();

}
