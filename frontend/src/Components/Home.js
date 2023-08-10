import React from "react";
import APIClient from '../Actions/apiClient';

import { withTranslation, useTranslation } from 'react-i18next';
import i18n from "i18next";

const Home = () => {
  const apiClient = new APIClient();
  const { t } = useTranslation();

  return (
    <div className="container">
      <div className="container-fluid">
        <p>Welcome</p>
        <p>{t('home.explanation')}</p>
      </div>
    </div>
  );
}


export default withTranslation()(Home);