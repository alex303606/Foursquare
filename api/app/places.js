const express = require('express');
const auth = require('../middleware/auth');
const permit = require('../middleware/permit');
const nanoid = require('nanoid');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Places = require('../models/Places');
const Comments = require('../models/Comments');

const config = require('../config');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, config.uploadPath);
	},
	filename: (req, file, cb) => {
		cb(null, nanoid() + path.extname(file.originalname));
	}
});

const upload = multer({storage});

const createRouter = () => {
	router.get('/', (req, res) => {
		Places.find().then(async result => {
			result.forEach(async place => {
				const comments = [];
				await Comments.find({placeId: place._id}).then(comment => {
					if (comment.length !== 0) {
						comment.forEach(c => {
							comments.push(c);
						});
					}
				});
				Promise.all(comments).then(comments => {
					console.log(place.title);
					console.log('1',comments);
				});
			});
			
			// Promise.all(promise).then(comments => {
			// 	console.log(comments);
			// });
			res.send(result);
		}).catch(error => res.send(error));
	});
	
	router.get('/:id', [auth], (req, res) => {
		Places.findById(req.params.id)
		.then(result => {
			res.send(result)
		}).catch(error => res.send(error));
	});
	
	router.post('/', [auth, upload.fields([{name: 'image'}])], (req, res) => {
		const placeData = req.body;
		if (req.files && req.files.image) {
			placeData.image = req.files.image[0].filename
		}
		
		const item = new Places(placeData);
		
		item.save()
		.then(places => res.send(places))
		.catch(error => res.status(400).send(error));
	});
	
	return router;
};

module.exports = createRouter;