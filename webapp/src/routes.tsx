

import React from "react";
import { Switch, Route, Redirect } from 'react-router-dom';
import Home from 'views/home';
import WorkoutSession from 'views/workoutSession';
import { ProtectedRoute, RestrictionType } from 'components/ProtectedRoute';
import Restricted from "views/Restricted";
import Error from 'views/Error';


function Routes() {
    return (
        <Switch>
            <Route exact path="/restricted" component={Restricted} />
            <Route exact path="/error/:why" component={Error} />

            <ProtectedRoute
                exact
                restrictionType={RestrictionType.AuthenticatedOnly}
                restrictionRedirect="/restricted"
                path="/beta/:code"
                component={WorkoutSession}/>

            <Route exact path="/" component={Home} />
            <Redirect to="/" />
        </Switch>
    );
}

export default Routes;