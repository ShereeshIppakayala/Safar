if(process.env.NODE_ENV != "production"){
   require("dotenv").config();
}
// console.log(process.env.SECRET);


const express = require("express");
const app = express();
const port = 5050;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dbUrl = process.env.ATLAS_DB_URL;

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
     mongoUrl: dbUrl,
     crypto : {
        secret: process.env.SECRET,
     },
     touchAfter: 24 * 3600,
    });

    store.on("error", () =>{
        console.log("ERROR in MONGO SESSION STORE", err)
    });

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000*60*60*24*10,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};


// app.get("/", (req,res)=>{
//     res.send("This is ROOT");
// });



app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res) =>{
//     let fakeUser = new User({
//         email: "std@gmail.com",
//         username: "std"
//     });

//     let registeredUser = await User.register(fakeUser, "hello");
//     res.send(registeredUser);
// });

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// LISTINGS 

app.get("/destination", (req, res) =>{
    res.render("listings/destination");
});

app.get("/community", (req, res)=>{
    res.render("listings/community");
})
// // INDEX ROUTE
// app.get("/listings", wrapAsync( async (req, res)=>{
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", {allListings});
// }));


// //NEW ROUTEE
// app.get("/listings/new", (req, res)=>{
//     res.render("listings/new.ejs");
// });


// // SHOW ROUTEE
// app.get("/listings/:id", wrapAsync( async (req, res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs", {listing});
// }));


// // CREATE ROUTEE
// app.post("/listings", validateListing, wrapAsync( async (req, res)=>{
//     if(!req.body.listing) {
//         throw new ExpressError(400, "send valid data for listing");
//     }
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     console.log(newListing);
//     res.redirect("/listings");
// }));


// // EDIT ROUTEE
// app.get("/listings/:id/edit", wrapAsync( async (req, res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
//      res.render("listings/edit.ejs", {listing});
// }));



// // UPDATE ROUTEE
// app.put("/listings/:id", validateListing, wrapAsync( async (req, res)=>{
//       let {id} = req.params;
//       await Listing.findByIdAndUpdate(id, {...req.body.listing})
//       console.log(req.body.listing);
//       res.redirect(`/listings/${id}`);
// }));



// // DELETE ROUTEEE
// app.delete("/listings/:id",  wrapAsync( async (req, res)=>{
//   let {id} = req.params;
//   let deletedListing = await Listing.findByIdAndDelete(id);
//   console.log(deletedListing);
//   res.redirect("/listings");
// }));


// REVIEWS

// REVIEWS POST ROUTEE
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) =>{
//    let listing = await Listing.findById(req.params.id)
//    let newReview = new Review(req.body.review);


//    listing.reviews.push(newReview);

//    await newReview.save();
//    await listing.save();

//    console.log("New Review saved");
//    res.redirect(`/listings/${listing._id}`);
// }));


// //  REVIEW DELETE ROUTEE
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res) =>{
//     let {id, reviewId} = req.params;

//     await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
// }));





app.use((req, res, next) => {
    next(new ExpressError(404, "page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.render("error.ejs" ,{message});
    // res.status(statusCode).send(message);
});


app.listen(port, ()=>{
    console.log("listning to port 5050");
});