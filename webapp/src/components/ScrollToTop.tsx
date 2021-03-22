import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { scrollToTop } from 'helpers/browser';

function ScrollToTop({ location }) {
    useEffect(() => {
        // setTimeout - put the scroll at the end of the event loop
        scrollToTop();

    }, [location]);

    return (null);
}

export default withRouter(ScrollToTop);
