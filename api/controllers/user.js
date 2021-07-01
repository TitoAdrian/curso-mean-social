'use strict';

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');

//Methodos de prueba
function home(req, res) {
	res.status(200).send({
		message: 'Hola mundo desde el servidor nodeJS'
	});
}

function pruebas(req, res) {
	res.status(200).send({
		message: 'Acción de pruebas en el servidor nodeJS'
	});
}

//Registro
function saveUser(req, res){
	var params = req.body;
	var user = new User();
	if (params.name && params.surname && params.nick && params.email && params.password) {

		user.name = params.name;
		user.surname = params.surname;
		user.nick = params.nick;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;

		// controlar usuarios duplicados
		User.find({ $or: [
			{email: user.email.toLowerCase()},
			{nick: user.nick.toLowerCase()}
		]}).exec((err, users) => {
			if (err) return res.status(500).send({ message: 'Error en la peticion de usuarios' });

			if(users && users.length >= 1){
				return res.status(200).send({ message: 'El usuario que intentas registrar ya existe' });
			} else {
				// cifra la password y guarda los datos
				bcrypt.hash(params.password, null, null, (err, hash) => {
					user.password = hash;

					user.save((err, userStored) => {
						if(err) return res.status(500).send({ message: 'Error al guardar el usuario' });

						if (userStored) {
							res.status(200).send({ user: userStored });
						} else {
							res.status(404).send({ message: 'No se ha registrado el usuario' });
						}
					});
				});
			}
		});

	}else{
		res.status(200).send({
			message: 'Envia todos los campos necesarios!!'
		})
	}
}

//login
function loginUser(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({ email: email }, (err, user) => {
		if (err) return res.status(500).send({ message: 'Error en la petición' });

		if (user) {
			bcrypt.compare(password, user.password, (err, check) =>{
				if ( check ){

					if (params.gettoken) {
						// generar y devolver token
						return res.status(200).send({ 
							token: jwt.createToken(user)
						});
					} else {
						//devolver datos de usuario
						user.password = undefined;
						return res.status(200).send({ user });
					}

				} else {
					return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
				}
			});
		} else {
			return res.status(404).send({ message: 'El usuario no se ha podido identificar!!' });
		}

	});
}

// Conseguir datos de un usuario
function getUser(req, res){
	var userId = req.params.id;

	User.findById(userId, (err, user) => {
		if (err) return res.status(500).send({ message: 'Error en la petición' });

		if (!user) return res.status(404).send({ message: 'El usuario no existe' });

		followThisUser(req.user.sub, userId).then((value) => {
			user.password = undefined;
			return res.status(200).send({
				following: value.following, 
				followed: value.followed,
				user: user
			});
		});
	});
}

async function followThisUser (identity_user_id, user_id){ 
	let following = await Follow.findOne({'user': identity_user_id, 'followed': user_id },(err, follow)=>{
		if(err) return handleError(err);
		return follow;
	});

	let followed = await Follow.findOne({'user': user_id, 'followed': identity_user_id }, (err, follow)=>{
		if(err) return handleError(err);
		return follow;
	});

	return {
		following: following,
		followed: followed
	}
}

// Devolver un listado de usuarios paginados
function getUsers(req, res){
	var identity_user_id = req.user.sub;

	var page = 1;
	if (req.params.page) {
		page = req.params.page;		
	}
	
	var itemsPerPage = 5;

	User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        User.countDocuments((err, total)=>{
            if(err) return res.status(500).send({message: 'Error en la petición'});
			if(!users) if(err) return res.status(404).send({message: 'No hay usuarios disponibles'});
			followUserIds(identity_user_id).then((value) => {

				return res.status(200).send({
					users: users,
					users_following: value.following,
					users_follow_me: value.followed,
					total: total,
					pages: Math.ceil(total/itemsPerPage)
				});
			});
        });
    });
}

async function followUserIds(user_id){

	var following = await Follow.find({"user": user_id}).select({'_id':0, '__v':0, 'user':0}).then((follows) => {
		//if(err) return handleError(err);
		//console.log(follows);
		return follows;
	}).catch(err => {
		console.log(err);
	});

	var followed = await Follow.find({"followed": user_id}).select({'_id':0, '__v':0, 'followed':0}).then((follows) => {
		//if(err) return handleError(err);
		//console.log(follows);
		return follows;
	}).catch(err => {
		console.log(err);
	});

	// Procesar following ids
	var following_clean = [];

	if(following !== undefined){
		following.forEach((follow) => {
			following_clean.push(follow.followed);
		});
	}

	// Procesar followed ids
	var followed_clean = [];

	if(followed !== undefined){
		followed.forEach((follow) => {
			followed_clean.push(follow.user);
		});
	}

	return{
		following: following_clean,
		followed: followed_clean
	}
}

function getCounters(req, res){
	var userId = req.user.sub;
	if(req.params.id){
		userId = req.params.id;	
	}

	getCountFollow(userId).then((value) => {
		return res.status(200).send(value);
	});
}

async function getCountFollow(user_id){
	var following = await Follow.countDocuments({ user:user_id }).exec().then((count) => {
		return count;
	}).catch((err) => { return handleError(err); });

	var followed = await Follow.countDocuments({ followed:user_id }).exec().then((count) => {
		return count;
	}).catch((err) => { return handleError(err); });

	var publications = await Publication.countDocuments({ user: user_id }).exec().then((count) => {
		return count;
	}).catch((err) => { return handleError(err); });

	return {
		following: following,
		followed: followed,
		publications: publications
	};
}

// Edicion de datos de usuario
function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	// borrar propiedad password
	delete update.password;

	if(userId != req.user.sub){
		return res.status(500).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
	}
	
	User.findOne({ $or: [
		{email: update.email.toLowerCase()},
		{nick: update.nick.toLowerCase()}
	]}).exec((err, users) => {
		if(users && users._id != userId) res.status(500).send({message: 'Los datos ya estan en uso'});
		User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
			if(err) return res.status(500).send({message: 'Error en la petición'});
			if(!userUpdate) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
	
			return res.status(200).send({ user: userUpdate });
		});
	});
}

// Subir archivos de imagen/avatar de usuario
function uploadImage(req, res){
	var userId = req.params.id;

	console.log(req);

	if (req.files) {
		var file_path = req.files.image.path;
		//console.log(file_path);

		var file_split = file_path.split('\\');
		//console.log(file_split);

		var file_name = file_split[2];
		//console.log(file_name);

		var ext_split = file_name.split('\.');
		//console.log(ext_split);

		var file_ext = ext_split[1];
		//0console.log(file_ext);

		if(userId != req.user.sub){
			return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
		}

		if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' ||	file_ext == 'gif') {
			// actualizar docuemto de usuario loggeado
			User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdate) => {
				if(err) return res.status(500).send({message: 'Error en la petición'});
				if(!userUpdate) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

				return res.status(200).send({ user: userUpdate });
			});
		} else {
			return removeFilesOfUploads(res, file_path, 'Extensión no valida');
		}

	} else {
		return res.status(200).send({ message: 'No se han subido archivos o imagenes' });
	}
}

function removeFilesOfUploads(res, file_path, message){
	fs.unlink(file_path, (err) => {
		return res.status(200).send({ message: message });
	});
}

function getImageFile(req, res){
	var image_file = req.params.imageFile;
	var path_file = './uploads/users/'+image_file;

	fs.exists(path_file, (exists) => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({ message: 'No existe la imagen...' });
		}
	});
}

module.exports = {
	home: home,
	pruebas: pruebas,
	saveUser: saveUser,
	loginUser: loginUser,
	getUser: getUser,
	getUsers: getUsers,
	getCounters: getCounters,
	updateUser: updateUser,
	uploadImage: uploadImage,
	getImageFile: getImageFile
}