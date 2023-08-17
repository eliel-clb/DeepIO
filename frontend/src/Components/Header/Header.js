import React, { useEffect, useState } from "react";
import APIClient from '../../Actions/apiClient';

import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';
import { useNavigate } from "react-router-dom";

import { withTranslation, useTranslation } from 'react-i18next';


import logo from '../../Static/Images/LOGOCLB.png';
import flag_fr from '../../Static/Images/fr_flag_icon.png';
import flag_gb from '../../Static/Images/uk_flag_icon.png';
import './Header.css';

const Header = () => {
  const [userIsLoggedIn, setUserLoggedIn] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const apiClient = new APIClient();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const getAuth = () => {
    return apiClient.getAuth().then(
      (data) => {
        setUserLoggedIn(true)
      }
    ).catch((err) => {
      console.log(err);
    })
  };

  useEffect(() => {
    getAuth();
  }, []);

  const logOut = (event) => {
    apiClient.logout();
    setUserLoggedIn(false);
    navigate('/login');
  }

  const closeBanner = (e) => {
    setShowBanner(false)
  }

  const changeLanguage = language => {
    if (language === 'en') {
      i18n.changeLanguage('en');
    }
    if (language === 'fr') {
      i18n.changeLanguage('fr-FR');
    }
  }

  var { message } = location.state || { message: '' }


  return (
    <div>
      <div id="top-header">

        <span className={"blue"}></span>
        <span className={"yellow"}></span>
        <span className={"orange"}></span>
        <span className={"violet"}></span>
        <span className={"blue"}></span>
        <span className={"yellow"}></span>
        <span className={"orange"}></span>
        <span className={"violet"}></span>
      </div>
      <Navbar variant="light" expand="lg">
        <Navbar.Brand href="https://www.centreleonberard.fr/">
          <img
            src={logo}
            className="d-inline-block align-top logoclb"
            alt="Gustave Roussy"
          />
        </Navbar.Brand>

        <Nav className="mr-auto" id="brand-link">
          <Nav.Link href="/" className="navbar-link"> DeepIO </Nav.Link>
        </Nav>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/">{t('header.home')}</Nav.Link>
            <span className="nav-link-separator">|</span>
            <Nav.Link href="/queue">{t('header.queue')}</Nav.Link>
            <span className="nav-link-separator">|</span>
            <Nav.Link href="/predict">{t('header.prediction')}</Nav.Link>
            <span className="nav-link-separator">|</span>
            <Nav.Link href="/history">{t('header.showhistory')}</Nav.Link>
          </Nav>
        </Navbar.Collapse>

        <NavDropdown title={t('languages.header')} id="language-selector" className='mr-auto'>
          <NavDropdown.Item id="language-en" onClick={() => changeLanguage('en')}>
            <img
              src={flag_gb}
              width="30"
              height="30"
              alt="English"
              className="d-inline-block align-top language-flag"
            />
            <p className="language-name">{t('languages.english')}</p>
          </NavDropdown.Item>
          <NavDropdown.Item id="language-fr" onClick={() => changeLanguage('fr')}>
            <img
              src={flag_fr}
              alt="French"
              width="30"
              height="30"
              className="d-inline-block align-top language-flag"
            />
            <p className="language-name">{t('languages.french')}</p>
          </NavDropdown.Item>
        </NavDropdown>

        <Navbar.Collapse id="profile-navbar-nav" className='justify-content-end'>
          <Nav >
            <Nav.Link href="/login" className={'mr-auto ' + (userIsLoggedIn ? 'hidden' : '')}>{t('header.showlogin')}</Nav.Link>
            {
              userIsLoggedIn ?

                <NavDropdown title={t('header.profile')} id="basic-nav-dropdown" className={'mr-auto ' + (userIsLoggedIn ? '' : 'hidden')}>
                  <NavDropdown.Item href="/profile">{t('header.showprofile')}</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logOut}>{t('header.showlogout')}</NavDropdown.Item>
                </NavDropdown> :
                <>
                </>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className={'banner ' + ((showBanner && message) ? '' : 'hidden')}>
        <p className="banner-message-text">{message}</p>
        <span className="banner-close" onClick={closeBanner}></span>
      </div>
    </div>
  )
}


export default withTranslation()(Header);