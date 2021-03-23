
import React, { useCallback, useEffect, useState } from "react"
import {speak} from './utils';
import { useParams, useHistory, Redirect } from "react-router-dom";
import WorkoutApp from './workoutApp';
import {
  Grid,
  Button,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import './preworkout.css';

const codes = [
  '432521',
  '432522',
  '432523',
  '432524',
  '432525',
  '432526',
  '432527',
  '432528',
  '432529',
  '432530'
]


function App() {
  const [stage, setStage] = useState('not_started');
  const { code } = useParams();

  const { t } = useTranslation();
  return (
    <div>
      {
        codes.indexOf(code)<0 ? 
          <Redirect to='/restricted'/>
        : <>
        {
          stage == 'not_started' ? <>
              <Grid
              container
              direction="column"
              alignItems="center"
              justify="center"
              className="preWorkoutContainer">

                  <Typography className="preWorkoutTypography" variant="h5" >
                      {t('RESTRICTED_TO_STORE_OWNER')}
                  </Typography>

                  <p className="preWorkoutActions">
                      <Button
                          variant="contained"
                          color="primary"
                          >
                          {t('REDIRECT_TO_AUTH')}
                      </Button>
                  </p>

              </Grid>
          </> : <>
            <WorkoutApp/>
          </>
        }
        </>
      }
      
    </div>
  );
}

export default App;
