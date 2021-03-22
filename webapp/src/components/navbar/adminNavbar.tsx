import React from 'react';
import { Button, IconButton } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import '../styles/adminNavbar.css';

function AdminNavbar() {
    return (
        <div className="container">
            <Button color="secondary">Dashboard</Button>
            <Button color="secondary">Settings</Button>
            <Button color="secondary">Orders</Button>

            <IconButton aria-label="delete">
                <AccountCircle />
            </IconButton>
        </div>
    );
}

export default AdminNavbar;
