import React, { useEffect, useState } from "react";
import { withRouter } from 'react-router';
import './Predict.css';
import APIClient from '../../Actions/apiClient';
import { useNavigate } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Dropzone from 'react-dropzone';
import Spinner from 'react-bootstrap/Spinner';

import { withTranslation, useTranslation } from 'react-i18next';
import i18n from "i18next";


const Predict = () => {

  const [userMail, setUserMail] = useState('');
  const [predictionTitle, setPredictionTitle] = useState('');
  const [dropzoneIsLocked, setDropzoneIsLocked] = useState(false);
  const [fileIsHidden, setFileIsHidden] = useState(true);
  const [file, setFile] = useState({});
  const [uploading, setUploading] = useState(false);
  const [successfulUpload, setSuccessfulUpload] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [otherError, setOtherError] = useState(false);
  const [noFileError, setNoFileError] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const apiClient = new APIClient();
  // Translation item
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onDrop = (files) => {
    var file = files[0]
    console.log(file)

    var new_name = `${file.name}_${+new Date()}`
    var new_name = `${+new Date()}_${file.name}`

    var renamed = new File([file], new_name, { type: file.type })
    renamed.path = new_name

    console.log(renamed);
    setFile(renamed);
    setDropzoneIsLocked(true);
    setFileIsHidden(false);
  }

  // Check the users auth token,
  // If there is none / it is blacklisted,
  // Push user to login, set message banner to appropriate message,
  // Store current location to redirect user back here after successful login
  useEffect(() => {
    apiClient.getAuth().then((data) => {
      setUserMail(data.logged_in_as.email)
    })
      .catch((err) => {
        if (err.response.status) {
          if (err.response.status === 401) {
            navigate("/login", {
              state: {
                from: 'Predict',
                message: i18n.t('messages.notauthorized')
              }
            });
          }
        }
      }),
      []
  })

  // Start uploading file, set state o pending,
  // Post to server
  function sendRequest() {
    let file = file;
    const formData = new FormData();
    formData.append("file", file);

    apiClient.uploadFile(formData).then(
      (data) => {
        setDropzoneIsLocked(true)
        setFileIsHidden(false)
        setSuccessfulUpload(true)
        setUploading(false)
      }).catch((err) => {
        setUploading(true)
      })
  };

  // File is an object, check whether it has properties
  function isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }
    return JSON.stringify(obj) === JSON.stringify({});
  };

  // Get file object and upload it to the server
  function uploadFiles(file) {

    if (Object.keys(file).length === 0) {
      setNoFileError(true)
      return;
    }

    setUploading(true);
    setNoFileError(true);
    setUploadError(false);

    var file = file;
    sendRequest()
  }

  // Remove file from selection by emptying the file object, reset all messages and button states
  function removeFile() {
    setFileIsHidden(true)
    setDropzoneIsLocked(false)
    setSuccessfulUpload(false)
    setUploading(false)
    setDeleteError(false)
    setFile({})
  }

  // Delete the previously uploaded file from the server and call removeFile to clear all messages, etc
  function deleteFile() {
    let file = file.name;
    apiClient.deleteFile({ 'filename': file }).then((data) => {
      removeFile();
    }).catch((err) => {
      setDeleteError(true)
    })
  }

  function startPrediction() {
    resetIndicators();

    if (!successfulUpload) {
      setFileError(true);
      return;
    }

    if (!predictionTitle) {
      setTitleError(true);
      return;
    }

    if (!userMail) {
      setOtherError(true);
      return;
    }

    let prediction = {
      "submittedBy": userMail,
      "predictionTitle": predictionTitle,
      "storedAt": file.path
    }

    // Create a new prediction in the database, return the auto generated ID, 
    // Pass ID into next function to save it in the history of the creator,
    // Pass the creator ID and the prediction ID to the last function to create a new item in the queue
    apiClient.createPrediction(prediction).then((data) => {
      apiClient.updateUserHistory({ "predictionID": data.data }).then((data) => {
        apiClient.createQueueItem(data.data).then((data) => {
          navigate("/queue", {
            state: {
              from: 'Predict',
              message: i18n.t('messages.newpredictionsuccess')
            }
          }).catch((err) => { console.log('Something went wrong while creating the queue item') })
        }).catch((err) => { console.log('Something went wrong while updating the user') })
      }).catch((err) => { console.log('Something went wrong while creating a new prediction') })
    })
  }

  function resetIndicators() {
    setFileError(false);
    setTitleError(false);
    setOtherError(false);
    setNoFileError(false);
    setUploadError(false);
    setDeleteError(false);
    setUploading(false);
  }

  return (
    <div className="container">
      <div className="container-fluid">
        <p className="dropzone-header">{t('prediction.header')}</p>
        <div className="new-prediction-form">
          <div className="input-left-side">
            <Dropzone
              onDrop={onDrop()}
              disabled={!isEmpty(file)}
            >
              {({ getRootProps, getInputProps }) => (
                <section className={'container ' + (this.state.dropzoneIsLocked ? 'hidden' : '')}>
                  <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <p>{t('prediction.dropzonehelper')}</p>
                  </div>
                </section>
              )}
            </Dropzone>

            <div className={'preview-file ' + (fileIsHidden ? 'hidden' : '')}>
              <p>{this.state.file.name}
                <span className={'remove-file ' + (successfulUpload ? 'hidden' : '')} onClick={removeFile()}></span>
              </p>
            </div>

            <Button variant="primary"
              className={'upload-button ' + ((successfulUpload) ? 'hidden' : '')}
              onClick={uploadFiles}
            >
              <div className={'container ' + (uploading ? 'hidden' : '')}>
                {t('prediction.startupload')}
              </div>
              <div className={'spinner-container ' + ((uploading) ? '' : 'hidden')}>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="upload-spinner"
                />
                <span>{t('prediction.uploading')}</span>
              </div>
            </Button>

            <p className={'prediction-error ' + (noFileError ? 'show' : 'hidden')}>
              {t('prediction.nofileerror')}
            </p>

            <p className={'prediction-error ' + (uploadError ? 'show' : 'hidden')}>
              {t('prediction.uploadError')}
            </p>

            <p className={'prediction-error ' + (deleteError ? 'show' : 'hidden')}>
              {t('prediction.deleteError')}
            </p>

            <p className={'prediction-success ' + (successfulUpload ? 'show' : 'hidden')}>
              {t('prediction.successfulUpload')}
            </p>

            <Button variant="danger"
              className={'upload-button ' + ((successfulUpload) ? '' : 'hidden')}
              onClick={deleteFile()}
            >
              {t('prediction.deletefile')}
            </Button>

          </div>
          <div className="input-right-side">
            <Form.Group controlId="formBasicFile">
              <Form.Control
                type="text"
                placeholder={t('prediction.titleplaceholder')}
                name='predictionTitle'
                value={predictionTitle}
                onChange={e => setPredictionTitle(e.target.value)}
                required
              />
              <Form.Text className="text-muted prediction-info">
                {t('prediction.predictiontitlehelp')}
              </Form.Text>

            </Form.Group>
          </div>
        </div>
        <hr />

        <p className={'prediction-error ' + (fileError ? 'show' : 'hidden')}>
          {t('prediction.fileisempty')}
        </p>
        <p className={'prediction-error ' + (titleError ? 'show' : 'hidden')}>
          {t('prediction.titleisempty')}
        </p>
        <p className={'prediction-error ' + (otherError ? 'show' : 'hidden')}>
          {t('prediction.othererror')}
        </p>

        <span className="text-muted prediction-info">{t('prediction.submitpredictioninfo')}</span>
        <br />
        <Button className={'btn btn-primary btn-prediction ' + (successfulUpload ? '' : 'disabled')} onClick={startPrediction()}>
          {t('prediction.submitprediction')}
        </Button>

      </div>
    </div>
  )
}
export default withRouter(withTranslation()(Predict));