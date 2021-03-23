import React from "react";
import { Route as ReactRouterDomRoute, Redirect } from "react-router-dom";
import { useAuthContext } from "state/AuthProvider";
import LoaderOverScreen from 'components/LoaderOverScreen';
import AuthHelper from 'helpers/auth';

export enum RestrictionType {
    StoreOwnerOnly,
    AuthenticatedOnly,
    Open,
}

interface ProtectedRouteType {
    component: React.ReactType,
    restrictionRedirect?: string,
    errorRedirect?: string,
    restrictionType?: RestrictionType,
    exact?: boolean,
    path: string
}


export const ProtectedRoute = ({
    component: Component,
    restrictionRedirect,
    restrictionType,
    errorRedirect,
    ...rest }: ProtectedRouteType) => {
    /**
     * Manage a Route loading and restriction behavior
     * Set a Store to load if needed
     * Wait for Loading to finish
     * Render
     * If not allowed to view this - redirect out
     */

    const { authenticated, user, loadingAuthState } = useAuthContext();
   

    const isAllowed = (): boolean => {
        // true iff user allowed to see this content

        switch (restrictionType as RestrictionType) {
            case RestrictionType.AuthenticatedOnly:
                return authenticated!;

        }
        return true;
    }


    const render = (routeProps: any) => {
        if (loadingAuthState || !authenticated) {
            return <div />;
        }

        // if (ifFailed()) {
        //     return <Redirect to={errorRedirect} />
        // }
        if (!isAllowed()) {
            return <Redirect to={restrictionRedirect} />
        }
        return <Component {...routeProps} />
    }

    React.useEffect(() => {
        if (!loadingAuthState && !authenticated) {
            console.log('user not logged in, redirecting to login');
            AuthHelper.signIn();
        }
    }, [loadingAuthState, authenticated])

    return (
        (false) ? (
            <LoaderOverScreen />
        ) :
            <ReactRouterDomRoute
                {...rest}
                render={render}
            />
    );
}