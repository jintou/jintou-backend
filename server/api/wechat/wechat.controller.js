/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/wechats              ->  index
 * POST    /api/wechats              ->  create
 * GET     /api/wechats/:id          ->  show
 * PUT     /api/wechats/:id          ->  update
 * DELETE  /api/wechats/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Wechat} from '../../sqldb';

var request = require('request');

var APPID = "wx45a1e16368ad52ba";
var SECRET = "049b70db6cba1b801fc66fa8a73413fc";

var access_token = "";
var refresh_token = "";
var openid = "";

var username = "";
 

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    return entity.updateAttributes(updates)
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Wechats
// export function index(req, res) {
//   Wechat.findAll()
//     .then(respondWithResult(res))
//     .catch(handleError(res));
// }

// Gets a single Wechat from the DB
export function show(req, res) {
  Wechat.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Wechat in the DB
export function create(req, res) {
  Wechat.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Wechat in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Wechat.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Wechat from the DB
export function destroy(req, res) {
  Wechat.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function index(req, res){
    //还要加验证程序，现在只是暂时让微信认证而已
    
    if(req.query.echostr){
      res.send(req.query.echostr);
    }    
    else{
      res.send(req.query.echostr);
      // res.send('<a href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx45a1e16368ad52ba&redirect_uri=http://e7a09da6.ngrok.io&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect">是这里</a>');
    }
}

export function create(req, res){
    res.send('<a href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx45a1e16368ad52ba&redirect_uri=http://e7a09da6.ngrok.io&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect">是这里</a>');    
}

export function wechatLogin(req, res){
  // 
  // res.redirect("http://e7a09da6.ngrok.io");
  // res.send(req.query.code);
  if(req.query.code){
    var code = req.query.code;
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?"+
              "appid=" + APPID +
              "&secret=" + SECRET +
              "&code=" + code +
              "&grant_type=authorization_code";
    // res.redirect(url);
    request.get(
        url,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //get access_token  
                var bodyObj = JSON.parse(body);         
                access_token = bodyObj.access_token;
                refresh_token = bodyObj.refresh_token;//not using now
                openid = bodyObj.openid;
                // // get user info
                var userInfoUrl = "https://api.weixin.qq.com/sns/userinfo?"+
                                  "access_token=" + access_token +
                                  "&openid=" + openid;
                request.get(
                  userInfoUrl,
                  function (error, response, body){
                    var bodyObj = JSON.parse(body);
                    username = bodyObj.nickname;
                    res.send(username);
                  }
                );

                //go to public page

            }
        }
    );    
  }




}
export function wechatOauthRedirect(req,res){
  var REDIRECT_URI = "http://e7a09da6.ngrok.io/wechatLogin";  
  var url = "https://open.weixin.qq.com/connect/oauth2/authorize?"+
            "appid="+APPID+
            "&redirect_uri="+REDIRECT_URI+
            "&response_type=code&scope=1&state=1#wechat_redirect";
  res.redirect(url);
}