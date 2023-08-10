import React from "react";
import './Login.css';
import APIClient from '../../Actions/apiClient';
import { useNavigate } from "react-router-dom";

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useTranslation, withTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  let navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordSecurityError, setPasswordSecurityError] = useState(false);
  const [wrongCredentials, setWrongCredentials] = useState(false);
  const [otherError, setOtherError] = useState(false);
  const apiClient = new APIClient()

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") {
      setEmail = value;
    } else if (name === "password") {
      setPassword = value;
    }
  };

  const resetIndicators = () => {
    setPasswordSecurityError(false);
    setWrongCredentials(false);
    setOtherError(false);
  };

  // Check user password and mail,
  // If successful, set token in localStorage, 
  // Redirect to previous page if it exists or home 
  const onSubmit = async (event) => {
    event.preventDefault();

    resetIndicators();

    if (password.length < 8) { // Maybe also uppercase and special chars?
      setPasswordSecurityError(true);
      return;
    }

    let user = {
      email,
      password
    };

    try {
      const response = await apiClient.login(user);
      localStorage.setItem('token', response.data.token);
      navigate('/');
      window.location.reload();
    } catch (err) {
      if (err.response.status === 401) {
        setWrongCredentials(true);
        return;
      }
      setOtherError(true);
    }
  };

  const sendMail = (event) => {
    event.preventDefault();
    apiClient.sendMail().then((data) => { console.log(data) })
  }

  return (
    <div className="container">
      <div className="container-fluid">

        <Form className='log-in-form col-8 col-centered' onSubmit={onSubmit()}>

          <Form.Group controlId="formBasicEmail">
            <Form.Label>{t('login.email')}</Form.Label>
            <Form.Control
              type="email"
              placeholder={t('login.emailplaceholder')}
              name='email'
              value={email}
              onChange={handleInputChange}
              required
            />
            <Form.Text className="text-muted">
              {t('login.emailhelp')}
            </Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('login.password')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={t('login.passwordplaceholder')}
              name='password'
              value={password}
              onChange={handleInputChange}
              required
            />

            <p className={'login-error ' + (passwordSecurityError ? 'show' : 'hidden')}>
              {t('login.passwordsecurityerror')}
            </p>
            <p className={'login-error ' + (wrongCredentials ? 'show' : 'hidden')}>
              {t('login.passwordcredentialerror')}
            </p>
            <p className={'login-error ' + (otherError ? 'show' : 'hidden')}>
              {t('login.othererror')}
            </p>

          </Form.Group>

          <Button variant="primary" type="submit">
            {t('login.loginbutton')}
          </Button>
        </Form>
        <a href='/register'>{t('login.registerlink')}</a>
        <br /><hr />
        <a onClick={sendMail()}>{t('login.forgotpasswordlink')}</a>

      </div>
    </div>
  );
};


export default withTranslation()(Login);