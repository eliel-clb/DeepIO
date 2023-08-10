import React, { useEffect } from "react";
import './Profile.css';
import APIClient from '../../Actions/apiClient';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";

import { withTranslation } from 'react-i18next';
import i18n from "i18next";

const Profile = () => {

  const [isFetchingData, setIsFetchingData] = useState(true);
  const [profile, setProfile] = useState({});
  const [email, setEmail] = useState('');
  const [emailRepeat, setEmailRepeat] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [oldPasswordWrong, setOldPasswordWrong] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [hasSpecialChars, setHasSpecialChars] = useState(false);
  const [hasUppercaseChars, setHasUppercaseChars] = useState(false);
  const [passwordSecurityError, setPasswordSecurityError] = useState(false);
  const [emailAlreadyUsed, setEmailAlreadyUsed] = useState(false);
  const [emailMismatch, setEmailMismatch] = useState(false);
  const [otherError, setOtherError] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isUsernameOpen, setIsUsernameOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);

  const apiClient = new APIClient();
  navigate = useNavigate();
  const { t } = useTranslation();



  // Check the users auth token,
  // If there is none / it is blacklisted,
  // Push user to login, set message banner to appropriate message,
  // Store current location to redirect user back here after successful login
  useEffect(() => {
    apiClient.getAuth().then((data) => {
      apiClient.getUserDetails(data.logged_in_as.email).then((data) => {
        setIsFetchingData(false);
        setProfile(data)
      })
    }).catch((err) => {
      if (err.response.status) {
        if (err.response.status === 401) {

          navigate("/login", {
            state: {
              from: 'Profile',
              message: i18n.t('messages.notauthorized')
            }
          });
        }
      }
    })
  },
    []
  )

  // const handleInputChange = (event) => {
  //   const { value, name } = event.target;
  //   this.setState({
  //     [name]: value
  //   });
  // }

  const resetIndicators = () => {

    setPasswordSecurityError(false);
    setwrongCredentials(false);
    setOtherError(false);

  }

  // Bool switches to toggle the password and email boxes
  function openChangeEmail() {
    setIsEmailOpen(!isEmailOpen)
    setIsPasswordOpen(false)
  }

  function openChangePassword() {
    setIsPasswordOpen(!isPasswordOpen)
    setIsEmailOpen(false)
  }

  // Check whether new mail and repeat mail are the same,
  // Pass mail to backend, see whether address is used,
  // Save it, if it is fresh, return error if it is in use
  const onSubmitEmail = (event) => {
    event.preventDefault();
    resetIndicators();

    if (email !== emailRepeat) {
      setEmailMismatch(true)
      return;
    }

    apiClient.changeEmail({ 'email': email })
      .then(res => {
        apiClient.logout()
      })
      .then(res => {

        navigate("/login", {
          state: {
            message: i18n.t('messages.emailchangesuccess')
          }
        });
        window.location.reload();
      }).catch((err) => {
        console.log(err)
        if (err.response.status === 409) {
          setEmailAlreadyUsed(true)
          return;
        }
        setOtherError(true)
      }
      )
  }

  // Check whether new password and repeat password are the same,
  // Check that length is at least 10 digits
  // Pass old password to backend and check for correctness
  // If the above holds, change password, else show appropriate error message
  const onSubmitPassword = (event) => {
    event.preventDefault();
    resetIndicators();

    if (password.length < 10) {
      setPasswordSecurityError(true)
      return;
    }

    if (password !== passwordRepeat) {
      setPasswordMismatch(true)

      return;
    }

    apiClient.checkPassword({ 'password': oldPassword }).then((result) => {
      apiClient.changePassword({ 'password': password })
        .then(res => {
          apiClient.logout()
        })
        .then(res => {

          navigate("/login", {
            state: {
              message: i18n.t('messages.passwordchangesuccess')
            }
          });
          window.location.reload();
        }).catch((err) => {
          console.log(err)
          setOtherError(true)
          return;
        })
    }).catch((err) => {
      if (err.response.status === 401) {
        setOldPasswordWrong(true)
        return;
      }
      setOtherError(true)
      return;
    })
  }

  return (
    <div className="container">
      <div className="container-fluid">

        <h2 className="profile-greeting">Hello, {profile.name}</h2>

        <div className="profile-settings-box">
          <div className={'change-profile-header ' + (isEmailOpen ? 'active' : '')}>
            <div className="change-profile-link" onClick={openChangeEmail()}>{t('profile.changemail')}</div>
          </div>
          <div className={'change-setting-container ' + (isEmailOpen ? 'col' : 'hidden')}>
            <Form className='email-change-form col-8 col-centered' onSubmit={onSubmitEmail()}>
              <Form.Group>
                <Form.Label>{t('profile.emailinput')}</Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t('profile.emailplaceholder')}
                  name='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Form.Label>{t('profile.emailrepeatinput')}</Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t('profile.emailrepeatplaceholder')}
                  name='emailRepeat'
                  value={emailRepeat}
                  onChange={e => setEmailRepeat(e.target.value)}
                  required
                />
                <Form.Text className="text-muted emailchange-info">
                  {t('profile.emailchangeinfo')}
                </Form.Text>
              </Form.Group>

              <Button variant="primary" type="submit" className="submit-profile-change">
                {t('profile.changemailsubmit')}
              </Button>
            </Form>
          </div>
        </div>

        <div className="profile-settings-box">
          <div className={'change-profile-header ' + (isPasswordOpen ? 'active' : '')}>
            <div className="change-profile-link" onClick={openChangePassword()}>{t('profile.changepassword')}</div>
          </div>
          <div className={'change-setting-container ' + (isPasswordOpen ? 'col' : 'hidden')}>
            <Form className='email-change-form col-8 col-centered' onSubmit={onSubmitPassword()}>
              <Form.Group>
                <Form.Label>{t('profile.oldpassword')}</Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t('profile.oldpasswordplaceholder')}
                  name='oldPassword'
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                />
                <Form.Label>{t('profile.newpassword')}</Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t('profile.newpasswordplaceholder')}
                  name='password'
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                />
                <Form.Label>{t('profile.repeatpassword')}</Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t('profile.repeatpasswordplaceholder')}
                  name='passwordRepeat'
                  value={passwordRepeat}
                  onChange={e => setPasswordRepeat(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="submit-profile-change">
                {t('profile.changepasswordsubmit')}
              </Button>
            </Form>
          </div>
        </div>

        <p className={'password-error ' + (emailMismatch ? 'show' : 'hidden')}>
          {t('profile.emailmismatcherror')}
        </p>
        <p className={'password-error ' + (emailAlreadyUsed ? 'show' : 'hidden')}>
          {t('profile.emailusederror')}
        </p>
        <p className={'password-error ' + (oldPasswordWrong ? 'show' : 'hidden')}>
          {t('profile.oldpasswordwrongerror')}
        </p>
        <p className={'password-error ' + (passwordMismatch ? 'show' : 'hidden')}>
          {t('profile.passwordmismatcherror')}
        </p>
        <p className={'password-error ' + (passwordSecurityError ? 'show' : 'hidden')}>
          {t('profile.passwordnotsecureerror')}
        </p>
        <p className={'password-error ' + (otherError ? 'show' : 'hidden')}>
          {t('profile.othererror')}
        </p>

      </div>
    </div>
  );
}


export default withTranslation()(Profile);
