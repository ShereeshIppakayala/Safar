const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");


const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


// INDEX ROUTE
router.get("/", wrapAsync( listingController.index ));


//NEW ROUTEE
router.get("/new", isLoggedIn, listingController.renderNewForm);


// SHOW ROUTEE
router.get("/:id", wrapAsync( listingController.showListing));


// CREATE ROUTE (handles file upload via multer)
router.post("/", upload.single("listing[image]"), validateListing, isLoggedIn, wrapAsync( listingController.createListing));


// EDIT ROUTEE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync( listingController.renderEditForm));



// UPDATE ROUTEE
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing));



// DELETE ROUTEEE
router.delete("/:id", isLoggedIn, isOwner,  wrapAsync( listingController.destroyListing));


module.exports = router;