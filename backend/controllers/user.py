from flask import request, jsonify
from application import mongo
from application import flask_bcrypt
from models.userModel import validate_user
from flask_jwt_extended import (get_jwt_identity)
from bson import json_util, ObjectId
import controllers.errors

# Try to find email address in database. If it is unique, make new user. Otherwise send error message
def createUser():
    data = validate_user(request.get_json())
    if data['ok']:
      data = data['data']
      userExists = mongo.db.users.find_one({'email': data['email']})
      if not userExists:
        data['password'] = flask_bcrypt.generate_password_hash(
          data['password'])
        result = mongo.db.users.insert_one(data)
        return jsonify({'ok': True, 'message': 'User created successfully!'}), 200
      else:
        return jsonify({'ok': False, 'message': 'User exists parameters!'}), 409
      return jsonify({'ok': False, 'message': 'Bad request parameters: {}'.format(data['message'])}), 400

# Look up prediction details in collection by prediction ID saved in user history array
# Return all values EXCEPT the ones in project
# Make a dict out of all this and return
def getUserDetails():
    currentUserMail = request.args['email']
    
    data =  mongo.db.users.aggregate(
      [
        {"$match": {"email": currentUserMail }}, 
        {"$lookup": {"from": "predictions", "foreignField": "_id", "localField": "history", "as": "submittedJobs"}},
        {"$project": {"submittedJobs.submittedBy": 0, "submittedJobs.storedAt": 0, "submittedJobs.vector": 0}}
      ]
    )
    
    user = {}
    data = (list(data))[0]
    user['email'] = data['email']
    user['name'] = data['name']
    user['submittedJobs'] = data['submittedJobs']
            
    if data:
      return json_util.dumps(user), 200
    return jsonify({'ok': False, 'message': 'No user!'}), 400

# Add new ID to set of prediction IDs
def updateUserHistory():
  try:
    current_user = get_jwt_identity()
    data = request.get_json()
    user = mongo.db.users.find_one({'email': current_user['email']})
    predictionID = ObjectId(data['predictionID'])
    user = mongo.db.users.find_and_modify({'email': current_user['email']}, {"$addToSet": {"history": predictionID}})

    returnValue = {}
    returnValue['predictionID'] = data['predictionID']
    returnValue['userID'] = str(user.get('_id'))
    
    return jsonify({'ok': True, 'data': returnValue }), 200
  except:
     return jsonify({'ok': False, 'message': 'Bad request parameters: {}'.format(data['message'])}), 400

# Find a user by ID, find a prediction in the user's history by ID, remove the prediction from the history, 
# Return the ID of the prediction
def removeFromUserHistory():
  try:
    data = request.get_json()
    userID = data['userID']['$oid']
    predictionID = data['predictionID']['$oid']
    user = mongo.db.users.find_and_modify({'_id': ObjectId(userID)}, {"$pull": {"history": ObjectId(predictionID)}})
    returnValue = {}
    returnValue['predictionID'] = predictionID
    return jsonify({'ok': True, 'data': returnValue}), 200
  except:
     return jsonify({'ok': False, 'message': 'Bad request parameters: {}'.format(data['message'])}), 400

# Check wether the password is right (before saving a new one, check the old one)  
def checkPassword():
  try:
    current_user = get_jwt_identity()
    data = request.get_json()
    user = mongo.db.users.find_one({'email': current_user['email']})
    if user and flask_bcrypt.check_password_hash(user['password'], data['password']):
      return jsonify({'ok': True, 'message': 'Password is correct.'}), 200
    return jsonify({'ok': False, 'message': 'Wrong credentials'}), 401
  except:
     return jsonify({'ok': False, 'message': 'Bad request parameters: {}'.format(data['message'])}), 400
   
# Make hash, save password    
def changePassword():
    current_user = get_jwt_identity()
    data = request.get_json()
    try:
      data['password'] = flask_bcrypt.generate_password_hash(data['password'])
      currentUser = mongo.db.users.update_one({'email': current_user['email']}, {'$set': {'password': data['password']}}, upsert=False)
      return jsonify({'ok': True, 'message': 'Email updated successfully!'}), 200
    except:
      return jsonify({'ok': False, 'message': 'Bad request parameters: {}'.format(data['message'])}), 400
   
# Check uniqeness of email address,
# Overwrite old one with new one or return error 
def changeEmail():
    current_user = get_jwt_identity()
    data = request.get_json()
    try:
      userExists = mongo.db.users.find_one({'email': data['email']})
      if not userExists:
        currentUser = mongo.db.users.update_one({'email': current_user['email']}, {'$set': {'email': data['email']}}, upsert=False)
        return jsonify({'ok': True, 'message': 'Email updated successfully!'}), 200
      else:
        return jsonify({'ok': False, 'message': 'User exists parameters!'}), 409
    except:
      return jsonify({'ok': False, 'message': 'Bad request parameters: {}'.format(data['message'])}), 400
