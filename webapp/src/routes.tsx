

import React from "react";
import { Switch, Route, Redirect } from 'react-router-dom';
import Home from 'views/home';
import WorkoutSession from 'views/workoutSession';
import Restricted from "views/Restricted";
import Error from 'views/Error';


function Routes() {
    return (
        <Switch>
            <Route exact path="/restricted" component={Restricted} />
            <Route exact path="/error/:why" component={Error} />

            <Route
                exact
                path="/beta/:code"
                component={WorkoutSession}/>

            <Redirect to="/beta/raanana" />
            
            <Route exact path="/" component={Home} />
            <Redirect to="/" />
        </Switch>
    );
}

export default Routes;