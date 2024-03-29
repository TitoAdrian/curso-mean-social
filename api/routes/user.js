'use strict'

var express = require('express');
var UserController = require('../controllers/user');
const multer  = require('multer');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/users')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) //Appending extension
    }
});

var upload = multer({ storage: storage });

api.get('/home', UserController.home);
api.get('/pruebas', md_auth.ensureAuth , UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, upload.single('image')], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);

module.exports = api;
