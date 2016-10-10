'use strict';

import {User} from '../../sqldb';
import {UserRole} from '../../sqldb';
import {UserProfile} from '../../sqldb';
import {UserGroup} from '../../sqldb';
import {Role} from '../../sqldb';
import {Space} from '../../sqldb';
import {Circle} from '../../sqldb';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
var Promise = require('bluebird');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var Jimp = require('jimp');
var profilePath = "/Users/hahi/Desktop/backend/jintou-backend/client/assets/profileImages";

function respondWithResult(res, statusCode) {

  statusCode = statusCode || 200;
  return function (entity) {
    //console.log('response entity:', JSON.stringify(entity));
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    return entity.updateAttributes(updates)
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json(err);
  }
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {

  User.belongsToMany(Role, { as: 'roles', through: UserRole });
  Role.belongsToMany(User, { as: 'users', through: UserRole });

  User.findAll({
    attributes: [
      '_id',
      'name',
      'loginId',
      'email',
      //'role',
      'provider'
    ],
    include: [
      {
        model: Role, as: 'roles'
      }
    ]
  })
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res, next) {
  var newUser = User.build(req.body);
  var invitor, inviteSpace;
  newUser.setDataValue('provider', 'local');
  newUser.setDataValue('role', 'user');
  console.log('body:',JSON.stringify(req.body));
  if (req.body.inviteCode) {
    var inviteCode = req.body.inviteCode;
    var sVars = inviteCode.split('#');
    //console.log('sVars:',JSON.stringify(sVars));
    inviteSpace = sVars[0];
    if (sVars[1]) {
      invitor = sVars[1];
    }
  }
  return newUser.save()
    .then(function (user) {
      newUser = user;
      var mySpaceData = {
        type: 'person.normal',
        name: 'mySpace_' + newUser.loginId,
        alias: 'mySpace from ' + newUser.loginId,
        apps: [
          {
            "name": "appEngine",
            "alias": "appEngine",
            "type": "app.core",
            "cores": {
              "role": {
                "grants": {
                  "admin": "adminSpaceRole|设置机构角色,adminUserRole|设置用户角色",
                  "everyone": "myRole|我的角色"
                }
              },
              "space": {
                "grants": {
                  "admin": [
                    {
                      "name": "adminSpace",
                      "alias": "机构设置"
                    },
                    {
                      "name": "appStore",
                      "alias": "应用商店"
                    }
                  ]
                }
              },
              "circle": {
                "grants": {
                  "admin": ["adminCircle|设置机构圈"],
                  "manager": ["manageCircle|管理机构圈"],
                  "everyone": ["circleMember|机构圈主页"]
                }
              }
            }
          },
          {
            "name": "userApp",
            "alias": "user app",
            "type": "app.core",
            "cores": {
              "user": {
                "grants": {
                  "admin": "myProfile,myFinance,myTrade"
                }
              }
            }
          }
        ]
      }
      //create default profile image

      Jimp.read(profilePath+"/default.png", function (err, image) {
          if (err) throw err;
          image.quality(100)                 // set JPEG quality
               .write(path.join(profilePath + "/"+ newUser.loginId + "_icon.png")); // save
      });

      //console.log('before addUserSpace:',JSON.stringify(mySpaceData));
      //console.log('inviteSpace:',inviteSpace);
      return Space.addUserSpace(user, mySpaceData, 'admin', 'created');
    })
    .then(function () { //join space by inviteCode
      //console.log('after addUserSpace:');
      //console.log('inviteSpace:',inviteSpace);
      if (inviteSpace) {
        return Space.getSpace(inviteSpace).then(function (space) {
          //console.log('after getSpace--space:',JSON.stringify(space));
          //console.log('after getSpace--user:',JSON.stringify(newUser));
          if(space){
            return Space.addUserSpace(newUser, space, 'member', 'joined', invitor);
          } else {
            return Promise.resolve(null);
          }     
        })
      } else {
        return Promise.resolve(null);
      }
    })
    .then(function (data) {
      //console.log('in create user:',JSON.stringify(data));
      var token = jwt.sign({ _id: newUser._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  User.belongsToMany(Role, { as: 'roles', through: UserRole });
  Role.belongsToMany(User, { as: 'users', through: UserRole });

  User.find({
    where: {
      _id: userId
    },
    include: [
      {
        model: Role, as: 'roles'
      }
    ]
  })
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  User.destroy({ _id: req.params.id })
    .then(function () {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.find({
    where: {
      _id: userId
    }
  })
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;
  //console.log('req header',req.headers);

  User.belongsToMany(Role, { as: 'roles', through: UserRole });
  Role.belongsToMany(User, { as: 'users', through: UserRole });

  return User.find({
    where: {
      _id: userId
    },
    attributes: [
      '_id',
      'name',
      'email',
      'loginId',
      'role',
      'provider'
    ],
    include: [
      {
        model: Role, as: 'roles'
      }
    ]
  })
    .then(user => { // don't ever give out the password or salt
      //console.log('me user:', JSON.stringify(user));
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res, next) {
  res.redirect('/');
}

function findAllProfile(req, res) {

  UserProfile.belongsTo(User, { as: 'user' });
  UserProfile.belongsTo(Role, { as: 'role' });
  UserProfile.belongsTo(Circle, { as: 'circle' });
  UserProfile.belongsTo(Space, { as: 'space' });

  var query = req.query;
  var includeData = [];
  var whereData = {};

  includeData.push(
    {
      model: User, as: 'user'
    }
  );

  if (query.spaceId) {
    includeData.push(
      {
        model: Space, as: 'space'
      }
    );
    whereData.spaceId = query.spaceId;
  }

  if (query.circleId) {
    includeData.push(
      {
        model: Circle, as: 'circle'
      }
    );
    whereData.circleId = query.circleId;
  }

  if (query.roleId) {
    includeData.push(
      {
        model: Role, as: 'role'
      }
    );
    whereData.roleId = query.roleId;
  }

  if (query.userId) {
    whereData.userId = query.userId;
  }

  return UserProfile.findAll(
    {
      where: whereData,
      include: includeData
    }
  )
}

export function queryAllProfile(req, res) {
  return findAllProfile(req, res)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function bulkAddProfile(req, res) {

  UserProfile.belongsTo(User, { as: 'user' });
  UserProfile.belongsTo(Role, { as: 'role' });
  UserProfile.belongsTo(Circle, { as: 'circle' });
  UserProfile.belongsTo(Space, { as: 'space' });

  var body = req.body;
  var bulkData = body.data;

  if (body.spaceId) {
    var spaceId = body.spaceId;
    bulkData.forEach(function (o) {
      o.spaceId = o.spaceId || spaceId;
    })
  }

  if (body.circleId) {
    var circleId = body.circleId;
    bulkData.forEach(function (o) {
      o.spaceId = o.circleId || circleId;
    })
  }

  var results = [];

  return Promise.map(bulkData, function (data) {
    var whereData = {};

    whereData.userId = data.userId;
    if (data.spaceId) {
      whereData.spaceId = data.spaceId;
    }
    if (data.circleId) {
      whereData.circleId = data.circleId;
    }
    if (data.roleId) {
      whereData.roleId = data.roleId;
    }
    UserProfile.findOrCreate(
      {
        where: whereData,
        defaults: data
      }
    ).then(function (entity, created) {
      results.push(entity);
    })
  }).then(function () {
    return Promise.resolve(results);
  })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function addUserGroup(req, res) {

  return UserGroup.add(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function findAllUserGroup(req, res) {

  return UserGroup.findAllByQuery(req.query)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function findOneUserGroup(req, res) {
  var query = {};

  if (req.params.id) {
    query.id = req.params.id;
  }
  if (req.query) {
    query = req.query;
  }

  return UserGroup.findOneByQuery(query)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function addUserGroupRole(req, res) {

  return UserGroup.addRole(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function findAllUserGroupRole(req, res) {
  return UserGroup.findAllRole(req.query).then(function (results) {
    return Promise.resolve(results);
  })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function profileImage(req, res){
  // create an incoming form object
  var user = req.query.id;
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = false;
  //res.send(__dirname);
  // store all uploads in the /uploads directory
  form.uploadDir = profilePath;

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    //var name = file.name + ".jpg";
    //res.send(name);
    var type = file.type.split("/")[1];
    // fs.rename(file.path, path.join(form.uploadDir, currentUser._id));
    var id = req.query.id;
    fs.rename(file.path, path.join(form.uploadDir,id + "." + type));
    // res.end(id + "." + type);
    // open a file called "lenna.png"
    Jimp.read(path.join(form.uploadDir,id + "." + type), function (err, image) {
        if (err) throw err;
        image.quality(100)                 // set JPEG quality
             .write(path.join(form.uploadDir + "/"+ id + "_icon.png")); // save
    });

  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function(err, fields, files) {
    // res.writeHead(200, {'content-type': 'text/plain'});
    // res.write('Received form:\n\n');
    // res.write(files);
    // res.send(files);
   //res.end(req.query.id);
  });

  // parse the incoming request containing the form data
  form.parse(req);
}
