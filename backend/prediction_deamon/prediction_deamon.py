from prediction_engine import Prediction_Engine
import json
import multiprocessing
import time
from pymongo import MongoClient
from bson import ObjectId
import numpy as np
import collections
import pandas as pd
import datetime
import os
import sys
sys.path.insert(1, './prediction_deamon')

ACCEPTED_FILE_TYPES = ['npy', 'sf']

# df_normalization_value = pd.read_csv('./prediction_deamon/ML_models/normalization_custom_loss.csv', index_col=0)
# TPM_MIN = df_normalization_value.loc['first_input_standardization']['x_min']
# TPM_MAX = df_normalization_value.loc['first_input_standardization']['x_max']

df_treatments = pd.read_csv('./prediction_deamon/treatment_to_simulate.csv')

df = pd.read_csv('./prediction_deamon/X_columns.csv')
genes_index = df['genes'].tolist()


def get_oldest_pred_in_queue(db):

    cursor = db.queue.find({})

    oldest_date = None
    oldest_pred_id = None

    for document in cursor:

        pred_id = document['predictionID']
        pred = db.predictions.find_one({'_id': ObjectId(pred_id)})

        if pred['storedAt'].split('.')[-1] in ACCEPTED_FILE_TYPES:
            time_started = pred['timeStarted']
            if oldest_date is None:
                oldest_date = time_started
                oldest_pred_id = pred_id
            else:
                if oldest_date > time_started:
                    oldest_date = time_started
                    oldest_pred_id = pred_id
    return oldest_pred_id


def normalize(x):
    return (x - TPM_MIN) / (TPM_MAX - TPM_MIN)


def load_salmon_file(file_path):
    df = pd.read_csv(file_path, sep='\t')
    df_name = df['Name'].str.split('|', 8, expand=True)
    df = df.drop(columns=['Name'])
    df = pd.concat([df_name, df], axis=1)
    df = df[[0, 1, 5, 'TPM']]
    df = df.dropna()

    genes_list = np.unique(df[1].values)
    gen_col = df[1].values
    gen_name_col = df[5].values
    tpm_col = df['TPM'].values

    result = collections.defaultdict(list)
    for val, idx in zip(tpm_col.ravel(), gen_col.ravel()):
        result[idx].append(val)
    summ = [np.sum(result[idx]) for idx in genes_list]

    result = collections.defaultdict(list)
    for val, idx in zip(gen_name_col.ravel(), gen_col.ravel()):
        result[idx].append(val)
    name = [result[idx][0] for idx in genes_list]

    df = pd.DataFrame(data={'gene': genes_list, 'name': name, 'TPM': summ, })
    df = df.drop(columns=['gene'])
    df = df.set_index('name')
    df = df.T
    df_data = df.values
    df_data = normalize(np.log10(df_data + 1))
    df = pd.DataFrame(data=df_data, columns=df.columns, index=['TPM'])

    return df


def get_pred_data(db, pred_id):
    """
    function that connect to the database and find the path of the data
    we need to make a prediction
    """
    pred = db.predictions.find_one({'_id': ObjectId(pred_id)})
    pred_file_name = '/app/uploads/' + pred['storedAt']
    file_path = pred_file_name
    extension = file_path.split('.')[-1]

    if extension == 'npy':
        data = np.load(file_path)
    elif extension == 'sf':
        data = load_salmon_file(file_path)
    return data


def make_json(result):
    d = {}
    patient_id = 0
    for patient in result:
        d[patient_id] = patient.tolist()
        patient_id += 1

    return json.dumps(d)


def put_data_in_db(db, id_pred, result):
    # jsonified_results = make_json(result)
    db.predictions.update_one({'_id': ObjectId(id_pred)}, {'$set': {
        'result': result,
        'timeEnded': datetime.datetime.utcnow()}}, upsert=False)


def remove_from_queue(db, pred_id):
    queue_ticket = db.queue.find_one({'predictionID': ObjectId(pred_id)})
    db.queue.delete_one({'_id': ObjectId(queue_ticket['_id'])})


def pred_with_treatement(pred_engine, pred_data):
    """
    make predictions with a treatement applied and return the results
    """
    simulation_result = {}

    all_X = []
    simulation_result['NO'] = pred_engine.predict(pred_data)

    # pour chaque ligant
    for treatment in df_treatments.ligand:

        # sdf ? acronyme de quoi
        # on prend la ligne qui correpond au  ligant
        sdf = df_treatments[df_treatments['ligand'] == treatment]

        # on selectionne la liste des genes liées a ces ligans
        targets = sdf['target_gene_symbol'].values

        # on prend l'affinity units
        affinity_units = sdf['affinity_units'].unique()[0]

        # on prend la medianne de l'affinity units
        affinity_median = sdf['affinity_median'].values

        # on fait une copie des data utilisée pour la prediction
        X_treatment = pred_data.copy(deep=True)

        # pour nombre de target (genes)
        for i in range(len(targets)):
            # pour le gene selectionnée
            t = targets[i]
            a = affinity_median[i]
            # s'il y a C50 dans affinity dans unique
            if 'C50' in affinity_units:
                # pred_data_gene[gene] *= affinity median
                X_treatment[t] *= a
            else:
                # si le mettre 0
                X_treatment[t] = 0

        # ajouter le resutlat de la prediction avec le traitement dans
        simulation_result[treatment] = pred_engine.predict(X_treatment)

    # make it JSON
    results = []
    for i in range(len(pred_data)):
        patient_pred = {}
        patient_pred['patient_id'] = 'patient_'+str(i)
        for treatment in simulation_result.keys():
            patient_pred[treatment] = simulation_result[treatment][i].tolist()
        results.append(patient_pred)

    print(results, flush=True)

    return results


def deamon_loop():

    # connect to the local database
    try:
        # connect to the local database
        connection = MongoClient(host = 'mongo_db', 
                                 port = int(os.environ['MONGO_PORT']),
                                 username = os.environ['MONGO_USERNAME'],
                                 password = os.environ['MONGO_PASSWORD']
                                 )
        db = connection[os.environ['DATABASE_NAME']]
        pred_engine = Prediction_Engine()

        while True:
            if db.queue.count_documents({}) > 0:
                # get the oldest prediction
                id_oldest_pred = get_oldest_pred_in_queue(db)

                if id_oldest_pred is not None:
                    try:
                        # get the data of the oldest prediction
                        pred_data = get_pred_data(db, id_oldest_pred)

                        # run the prediction
                        # pred_result = pred_engine.predict(pred_data)
                        pred_result = pred_with_treatement(
                            pred_engine, pred_data)
                    except:
                        pred_result = []

                    # put the results in the database
                    put_data_in_db(db, id_oldest_pred, pred_result)

                    # remove the request from the queue
                    remove_from_queue(db, id_oldest_pred)
            time.sleep(5)
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")


def start_prediction_deamon():
    """ 
      when you start the backend app the prediction daemon starts 
    """
    # Pyhton library that allows you perform parallel processing

    proc = multiprocessing.Process(target=deamon_loop, args=(), daemon=True)
    # process starts

    proc.start()
    print('# Prediction engine started with PID: ' + str(proc.pid))
