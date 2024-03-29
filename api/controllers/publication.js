'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res){
    res.status(200).send({
        message: "Hola desde el controllador de publicaciones"
    });
}

function savePublication(req, res){
    var params = req.body;

    var publication = new Publication();

    if(!params.text){
        return res.status(200).send({
            message: 'Debes enviar un texto!!'
        });
    }

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix(); 

    publication.save((err, publicationStored) => {
        if(err) return res.status(500).send({message: 'Error al guardar la publicacion'});

        if(!publicationStored) return res.status(404).send({message: 'La publicacion No ha sido guardada'});

        return res.status(200).send({publication: publicationStored});
    })

}

function getPublications(req, res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error al devolver el seguimiento'});

        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        follows_clean.push(req.user.sub);

        Publication.find({user: {$in: follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) =>{
            if(err) return res.status(500).send({message: 'Error al devolver publicaciones'});

            if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total/itemsPerPage),
                page: page,
                itemsPerPage: itemsPerPage,
                publications: publications
            });
        });

    });
}

function getPublicationsUser(req, res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var user = req.user.sub;
    if(req.params.user){
        user = req.params.user;
    }

    var itemsPerPage = 4;

    Publication.find({user: user}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) =>{
        if(err) return res.status(500).send({message: 'Error al devolver publicaciones'});

        if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

        return res.status(200).send({
            total_items: total,
            pages: Math.ceil(total/itemsPerPage),
            page: page,
            itemsPerPage: itemsPerPage,
            publications: publications
        });
    });
}

function getPublication(req, res){
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if(err) return res.status(500).send({message: 'Error al devolver la publicacion'});
        if(!publication) return res.status(404).send({message: 'No existe la publicacion'});

        return res.status(200).send({
            publication: publication
        });
    });

}

function deletePublication(req, res){
    var publicationId = req.params.id;

    Publication.find({'user': req.user.sub, '_id': publicationId}).remove((err, publicationRemoved) => {
        if(err) return res.status(500).send({message: 'Error al borrar publicaciones'});
        if(!publicationRemoved) return res.status(404).send({message: 'No se ha borrado la publicación'});
        return res.status(200).send({
            message: 'Publicación elimiada correctamente'
        });
    });
}

function uploadImage(req, res){
	var publicationId = req.params.id;

	if (req.file) {
		var file_path = req.file.originalname;

		var file_split = file_path.split('.');

		var file_name = file_split[0];

		var file_ext = file_split[1];

		if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' ||	file_ext == 'gif' || file_ext === "webp" ) {
            Publication.findOne({'user': req.user.sub, '_id': publicationId}).exec((err, publication)=>{
                if(publication){
                    // actualizar docuemto de publicación
                    Publication.findByIdAndUpdate(publicationId, { file: file_path }, { new: true }, (err, publicationUpdate) => {
                        if(err) return res.status(500).send({message: 'Error en la petición'});
                        if(!publicationUpdate) return res.status(404).send({ message: 'No se ha podido actualizar la publicacion' });

                        return res.status(200).send({ publication: publicationUpdate });
                    });
                }else{
                    return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar esta publicación');
                }
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
	var path_file = './uploads/publications/'+image_file;
	fs.exists(path_file, (exists) => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({ message: 'No existe la imagen...' });
		}
	});
}

module.exports = {
    probando: probando,
    savePublication: savePublication,
    getPublications: getPublications,
    getPublicationsUser: getPublicationsUser,
    getPublication: getPublication,
    deletePublication: deletePublication,
    uploadImage: uploadImage,
    getImageFile: getImageFile
}