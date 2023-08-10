import React, {useState} from "react";
import { withRouter } from 'react-router';
import './Register.css';
import APIClient from '../../Actions/apiClient';
import { useNavigate } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useTranslation, withTranslation } from 'react-i18next';

const Register = (props) => {
  const { t , i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [passwordSecurityError, setPasswordSecurityError] = useState(false);
  const [emailAlreadyUsed, setEmailAlreadyUsed] = useState(false);
  const [otherError, setOtherError] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const apiClient = APIClient();
  const navigate = useNavigate();


  const handleInputChange = (event) => {
    const { value, name } = event.target;
  
    switch (name) {
      case 'email':
        setEmail(value);
        break;
      case 'name':
        setName(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'passwordRepeat':
        setPasswordRepeat(value);
        break;
      default:
        break;
    }
  };
  


  const resetIndicators = () => {
    setPasswordMismatch(false);
    setPasswordSecurityError(false);
    setEmailAlreadyUsed(false);
    setOtherError(false);
  }

  // Check whether all the data passes the criteria specified,
  // Pass to backend, check whether email address is unique
  // Save user and redirect with success message or show appropriate error message
  const onSubmit = (event) => {
    event.preventDefault();

    resetIndicators();

    if (password !== passwordRepeat) {
      setPasswordMismatch(true);
      return;
    }

    if (password.length < 10) {
      setPasswordSecurityError(true);
      return;
    }

    let newUser = {
      email,
      name,
      password
    };

    apiClient.createUser(newUser).then((data) => {
      navigate("/login", {
        state: {
          from: '/',
          message: i18n.t('messages.registrationsuccess')
        }
      });
    }).catch((err) => {
      if (err.response.status === 409) {
        setEmailAlreadyUsed(true);
        return;
      };
      setOtherError(true);
    }
    )
  };
  return (
    <div className="container">
      <div className="container-fluid">
        <Form className='sign-up-form col-8 col-centered' onSubmit={onSubmit()}>
          <Form.Group>
            <Form.Label>{t('register.emailaddress')}</Form.Label>
            <Form.Control
              type="email"
              placeholder={t('register.emailplaceholder')}
              name='email'
              value={email}
              onChange={e => handleInputChange(e)}
              required
            />
            <Form.Text className="text-muted">
              {t('register.emailhelper')}
            </Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('register.name')}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t('register.nameplaceholder')}
              name='name'
              value={name}
              onChange={e => handleInputChange(e)}
              required
            />
            <Form.Text className="text-muted">
              {t('register.namehelper')}
            </Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('register.password')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={t('register.passwordplaceholder')}
              name='password'
              value={password}
              onChange={e => handleInputChange(e)}
              required
            />

            <Form.Label>{t('register.repeatpassword')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={t('register.repeatpasswordplaceholder')}
              name='passwordRepeat'
              value={passwordRepeat}
              onChange={handleInputChange}
              required
            />

            <p className={'password-error ' + (passwordMismatch ? 'show' : 'hidden')}>
              {t('register.passwordmismatcherror')}
            </p>
            <p className={'password-error ' + (passwordSecurityError ? 'show' : 'hidden')}>
              {t('register.passwordinsecureerror')}
            </p>
            <p className={'password-error ' + (emailAlreadyUsed ? 'show' : 'hidden')}>
              {t('register.emailtakenerror')}
            </p>
            <p className={'password-error ' + (otherError ? 'show' : 'hidden')}>
              {t('register.othererror')}
            </p>
          </Form.Group>

          <Button variant="primary" type="submit">
            {t('register.submitbutton')}
          </Button>

        </Form>

        <a href='/login'>{t('register.loginlinkbottom')}</a>

      </div>
    </div>
  );

}

export default withRouter(withTranslation()(Register));