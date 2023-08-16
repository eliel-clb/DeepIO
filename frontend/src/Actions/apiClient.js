import axios from 'axios';
import env from "react-dotenv";
// Obviously needs to get changed if the server port / address is changing


// var DOMAIN = env['DOMAIN']
// var BACKEND_PORT = env['BACKEND_PORT']
var DOMAIN = 'localhost'
var BACKEND_PORT = '8002'

const BASE_URI = 'http://' + DOMAIN + ':' + BACKEND_PORT.toString();

const client = axios.create({
  baseURL: BASE_URI,
});

const APIClient = () => {
  const getToken = () => localStorage.getItem('token');

  const perform = async (method, resource, data) => {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await client({
        method,
        url: resource,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };

  const login = async (user) => perform('post', '/login', user);
  const getAuth = async () => perform('get', '/hasAuth');
  const logout = async () => {
    await perform('delete', '/logoutAccessToken');
    console.log('done');
  };
  const refresh = async () => perform('post', '/refresh');

  const createUser = async (newUser) => perform('post', '/user', newUser);
  const getUser = async (user) => perform('get', '/user', user);
  const updateUserHistory = async (predictionID) => perform('put', '/updateUserHistory', predictionID);
  const removeFromUserHistory = async (ids) => perform('delete', '/removeFromUserHistory', ids);
  const changeEmail = async (email) => perform('put', '/changeEmail', email);
  const checkPassword = async (oldPassword) => perform('post', '/checkPassword', oldPassword);
  const changePassword = async (newPassword) => perform('put', '/changePassword', newPassword);
  const getUserDetails = async (email) => perform('get', '/user', { params: { email } });

  const createPrediction = async (prediction) => perform('post', '/prediction', prediction);
  const deletePrediction = async (predictionID) => perform('delete', `/prediction/${predictionID}`);

  const createQueueItem = async (newQueueItem) => perform('post', '/queue', newQueueItem);
  const getQueue = async () => perform('get', '/queue');
  const deleteQueueItem = async (queueItem) => perform('delete', `/queue/${queueItem}`);

  const uploadFile = async (file) => perform('post', '/upload', file);
  const deleteFile = async (file) => perform('delete', '/upload', file);

  const sendMail = async () => perform('get', '/mail');

  return {
    login,
    getAuth,
    logout,
    refresh,
    createUser,
    getUser,
    updateUserHistory,
    removeFromUserHistory,
    changeEmail,
    checkPassword,
    changePassword,
    getUserDetails,
    createPrediction,
    deletePrediction,
    createQueueItem,
    getQueue,
    deleteQueueItem,
    uploadFile,
    deleteFile,
    sendMail,
  };
};

export default APIClient;
