
import React from "react";
import Routes from "routes";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'state/AuthProvider';

import ScrollToTop from "components/ScrollToTop";
import 'styles/App.css';
import { ToastProvider } from "services/Toast";
import { OperationApprovalProvider } from "services/OperationApproval";

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
                <ToastProvider>
                    <OperationApprovalProvider>
                        <Routes />
                    </OperationApprovalProvider>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;