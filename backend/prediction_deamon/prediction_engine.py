import keras
from os import listdir
from os.path import isfile, join
from keras.models import load_model
import pandas as pd
import numpy as np
from keras.models import load_model
import keras.losses
import tensorflow as tf
from keras import backend as K

def mse_nan(y_true, y_pred):
    mask = tf.greater_equal(y_true, tf.constant([0.0], dtype = tf.float32))
    mask = tf.cast(mask, tf.float32)
    y_true = tf.multiply(y_true, mask)
    y_pred = tf.multiply(y_pred, mask)
    mse_masked = K.mean((y_true - y_pred) ** 2)
    return mse_masked

keras.losses.mse_nan = mse_nan


class Prediction_Engine:
    
    
  def __init__(self):
    self.path_to_model = './prediction_deamon/ML_models/best_model_custom_loss_weighted.h5'
    self.model = load_model(self.path_to_model)

    self.path_to_model_inputs =  './prediction_deamon/X_columns.csv'

    df = pd.read_csv(self.path_to_model_inputs)
    self.genes_used = df['genes'].tolist()

    # df_normalization_value = pd.read_csv('./prediction_deamon/ML_models/normalization_custom_loss.csv', index_col=0)
    # self.TPM_MIN = df_normalization_value.loc['second_input_standardization']['x_min']
    # self.TPM_MAX = df_normalization_value.loc['second_input_standardization']['x_max']
    # print(self.TPM_MIN, self.TPM_MAX)

    # self.OUTPUT_MIN = df_normalization_value.loc['output_standardization']['x_min']
    # self.OUTPUT_MAX = df_normalization_value.loc['output_standardization']['x_max']
    # print(self.OUTPUT_MIN, self.OUTPUT_MAX)

  def normalize_input(self, x):
    return (x - self.TPM_MIN) / (self.TPM_MAX - self.TPM_MIN)


  def normalize_output(self, x):
    return (x - self.OUTPUT_MIN) / (self.OUTPUT_MAX - self.OUTPUT_MIN)

  def compute_os(arr):
    """
      Determine OS from the model predictions
    """
    os = np.zeros(arr.shape[:-1])
    for i in range(arr.shape[0]):
        os[i] = (arr[i] > 0.5).astype('int32').sum()
    return os
  
  def predict(self, X):    
    """
      function to call the class to make a prediction, with the data      
    """
    pred = None
    if type(X) is pd.core.frame.DataFrame: # if Salmon input
        selected_TPM = []
        for g in self.genes_used:
          selected_TPM.append(X[g]['TPM'])
        selected_TPM = np.array(selected_TPM).reshape((1, len(selected_TPM)))
        # selected_TPM = self.normalize_input(selected_TPM)
        pred = self.model.predict(selected_TPM)
        # pred = pred.reshape(pred.shape[:-1])
        # pred = self.normalize_output(pred)
        os = self.compute_os(pred)
    return os 
    # return pred