const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground')

const {isLoggedIn,isAuthor,validateCampground} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');

const upload = multer({storage})

// console.log(isLoggedIn)


//fancier way to structure our same path routes 

router.route('/')
        .get(catchAsync(campgrounds.index))
        .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))
        

        router.get('/new',isLoggedIn, campgrounds.renderNewForm);
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))
// router.get('/',catchAsync( campgrounds.index ));


//making a new campground
// router.post('/', isLoggedIn,validateCampground, catchAsync(campgrounds.createCampground));


// router.get('/:id',catchAsync(campgrounds.showCampground));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm));

//update
// router.put('/:id',isLoggedIn,isAuthor,catchAsync(campgrounds.updateCampground));

// router.delete('/:id',isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground));


module.exports =router;