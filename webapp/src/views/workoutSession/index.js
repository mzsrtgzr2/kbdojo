
import React, { useCallback, useEffect, useState } from "react"
import {speak} from './utils';
import { useParams, useHistory, Redirect } from "react-router-dom";
import WorkoutApp from './workoutApp';
import InstructionsImage from 'assets/instructions.jpg';

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
  const start = ()=>{
    speak('Start working out')
    setStage('workout');
  };

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

                  <Typography className="preWorkoutTypography" variant="h3" >
                      {t('APP_NAME')}
                  </Typography>

                  <div className="instructions">
                    <Typography color="secondary" variant="h4" >
                        {t('INSTRUCTIONS.LINE1')}
                    </Typography>

                    <Typography color="secondary" variant="h4" >
                        {t('INSTRUCTIONS.LINE2')}
                    </Typography>

                    <Typography color="secondary" variant="h4" >
                        {t('INSTRUCTIONS.LINE3')}
                    </Typography>
                  </div>

                  <img src={InstructionsImage}/>

                  <p className="preWorkoutActions">
                      <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={start}
                          >
                          {t('START')}
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
