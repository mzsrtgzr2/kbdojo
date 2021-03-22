import React, { useState } from 'react';
import { Link } from "react-router-dom";

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import styles from './Appbar.module.css';
import { useTranslation } from 'react-i18next';
import { useAppBarContext } from 'state/AppBarProvider';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AuthHelper from 'helpers/auth';

interface AppBarRoute {
    path: string,
    label: string,
}

interface Props {
    children: any,
    routes: Array<AppBarRoute>
}


export default function ({ children, routes }: Props) {
    const { t } = useTranslation();
    const [drawer, setDrawer] = useState(false);
    const { appBarTitle, appBarRightSide } = useAppBarContext();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuId = 'profile-menu-id';

    const isMenuOpen = Boolean(anchorEl);

    const toggleDrawer = () => {
        setDrawer(!drawer);
    };

    const onItemClick = () => {
        setDrawer(!drawer);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const logout = () => {
        AuthHelper.signOut();
        handleMenuClose();
    }

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const renderProfileMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={logout}>
                {t('SIGNOUT')}
            </MenuItem>
        </Menu>
    )

    return (
        <div className={styles.root}>

            <AppBar
                color="inherit"
                position="fixed"
                elevation={0}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="Menu"
                        onClick={onItemClick}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        color="inherit"
                        className={styles.title}
                    >
                        {t(appBarTitle)}
                    </Typography>
                    <div className={styles.sideActionArea}>
                        {appBarRightSide}

                        <IconButton
                            onClick={handleProfileMenuOpen}
                            aria-label="account of current user"
                            aria-controls="primary-search-account-menu"
                            aria-haspopup="true"
                            color="inherit">
                            <AccountCircle />
                        </IconButton>
                        {renderProfileMenu}
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer open={drawer} onClose={toggleDrawer}>
                <List className={styles.drawerList}>
                    {
                        routes.map(route => (
                            <ListItem
                                key={route.path}
                                button
                                component={Link}
                                to={route.path}
                                onClick={onItemClick}>
                                <ListItemText>{t(route.label)}</ListItemText>
                            </ListItem>
                        ))
                    }

                </List>
            </Drawer>
            <div className={styles.contentWrapper}>
                {children}
            </div>
        </div>
    );
}