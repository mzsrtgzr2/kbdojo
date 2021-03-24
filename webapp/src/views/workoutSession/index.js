
import React, { useCallback, useEffect, useState } from "react"
import {speak} from './utils';
import { useParams, useHistory, Redirect } from "react-router-dom";
import WorkoutApp from './workoutApp';

import MainImage from 'assets/main.png';

import { Mixpanel } from 'mixpanel';

import {
  Grid,
  Button,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import './preworkout.css';

const codes = [
  'raanana',
  '132521',
  '132522',
  '132523',
  '132524',
  '132525',
  '132526',
  '132527',
  '132528',
  '132529',
  '132530',
  '232521',
  '232522',
  '232523',
  '232524',
  '232525',
  '232526',
  '232527',
  '232528',
  '232529',
  '232530',
]


function App() {
  const [stage, setStage] = useState('not_started');
  const { code } = useParams();

  const { t } = useTranslation();
  const start = ()=>{
    speak('Start working out')
    setStage('workout');
    Mixpanel.track('start_button')
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

              
                  <img src={MainImage} className="instructionsImage"/>

                  <p className="preWorkoutActions">
                      <Button
                        className="startButton"
                          variant="contained"
                          color="primary"
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
