
import React, { useCallback, useEffect, useState } from "react"
import {speak} from './utils';
import { useParams, useHistory, Redirect } from "react-router-dom";
import WorkoutApp from './workoutApp';
import FirebaseOps from "helpers/firebaseOps";

import MainImage from 'assets/main.png';

import TitleImage from 'assets/title.png';
import FacebookLoginImage from 'assets/facebook_login.jpeg';
import GoogleLoginImage from 'assets/google_login.jpeg';
import AnonymousLoginImage from 'assets/anonymous_login.jpg';

import { Mixpanel } from 'mixpanel';
import AuthHelper from 'helpers/auth';

import {
  Grid,
  Button,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import './preworkout.css';

const generateStringArray = (pat)=>[...Array(10)].map((_, i) => `${pat}${i}`)

const sawHelpPage = localStorage.getItem('saw_help_page')

function App() {
  const [stage, setStage] = useState(
    sawHelpPage=='yes' || process.env.NODE_ENV=='development' ? 'workout': 'not_started');
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {

    FirebaseOps.auth.onAuthStateChanged((user) => {
        setUser(user);
        if (!!user){
            Mixpanel.identify(user.email);
            Mixpanel.people.set({
                "$email": user.email,
                "name": user.displayName
            });
        }
        setLoadingAuthState(false);
    });
}, []);

const signInGoogleFunc = async ()=>{
  try{
    await AuthHelper.signInGoogle();
  } catch (e) {
    setError(e.message);
  }
}

const signInFacebookFunc = async ()=>{
  try{
    await AuthHelper.signInFacebook();
  } catch (e) {
    setError(e.message);
  }
}

const signInAnonymousFunc = async ()=>{
  try{
    await AuthHelper.signInAnonymous();
  } catch (e) {
    setError(e.message);
  }
}

  const start = ()=>{
    localStorage.setItem('saw_help_page', 'yes');
    setStage('workout');
    Mixpanel.track('start_button')
  };

  const renderAuthed = ()=>(
    <div>

        {
          stage == 'not_started' ? <>
              <Grid
              container
              direction="column"
              alignItems="center"
              justify="center"
              className="preWorkoutContainer">

                  <img src={MainImage} className="instructionsImage"/>
                  {process.env.NODE_ENV=='development' && <Typography>development env</Typography>}
                  <p className="preWorkoutActions">
                      <Button
                        className="startButton"
                          variant="contained"
                          color="primary"
                          onClick={start}
                          >
                          {t('OK')}
                      </Button>
                  </p>
                  

              </Grid>
          </> : <>
            <WorkoutApp/>
          </>
        }      
    </div>
  );
    
  if (loadingAuthState){
    return (
      <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      className="preWorkoutContainer">
        <Typography variant="h2">loading...</Typography></Grid>);
  }

  const authenticated = !!user
  return (
    <div>
          {!authenticated &&
            <Grid
              container
              direction="column"
              alignItems="center"
              justify="center"
              className="preWorkoutContainer">
                <img src={TitleImage} className="titleImage"/>
                <Button><img src={FacebookLoginImage} className="loginImage" onClick={signInFacebookFunc}/></Button>
                <Button><img src={GoogleLoginImage} className="loginImage"  onClick={signInGoogleFunc}/></Button>
                <Button><img src={AnonymousLoginImage} className="loginImage"  onClick={signInAnonymousFunc}/></Button>

                <Typography color="primary">{error}</Typography>
            </Grid>                  
          }
          {authenticated && renderAuthed()}
      </div>
  );
}

export default App;
