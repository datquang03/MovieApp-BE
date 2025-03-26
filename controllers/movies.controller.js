import { moviesData } from "../data/MoviesData.js";
import Movie from "../models/movies.model.js";
import asyncHandler from "express-async-handler";
// ------- PUBLIC CONTROLLER ------- //

// import movies
const importMovies = asyncHandler(async (req, res) => {
  // make sure movie collection is empty
  await Movie.deleteMany({});
  const movies = await Movie.insertMany(moviesData);
  res.status(200).json(movies);
});

// get all movies
const getMovies = asyncHandler(async (req, res) => {
  try {
    // filter movies by category, language, year, time, rate, and sort by rate and search
    const {
      category,
      language,
      year,
      time, // in minutes
      rate,
      search,
    } = req.query;
    let query = {
      ...(category && { category }),
      ...(language && { language: { $regex: language, $options: "i" } }),
      ...(year && { year }),
      ...(time && { time }),
      ...(rate && { rate }),
      ...(search && { name: { $regex: search, $options: "i" } }),
    };

    // load more movies
    const page = Number(req.query.pageNumber) || 1; // default to page 1 if pageNumber is not provided
    const limit = 100; // 4 movies per page
    const skip = (page - 1) * limit; // skip 2 movies per page

    // find movie by query, skip and limit
    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // get total number of movies
    const count = await Movie.countDocuments(query);

    // calculate total number of pages and send response
    res.json({
      movies,
      page,
      pages: Math.ceil(count / limit), // total pages
      totalMovies: count, // total movies
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get movie by id
const getMovie = asyncHandler(async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      res.status(404).json({ message: "Movie not found" });
    } else {
      res.status(200).json(movie);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get movie by top rated
const getTopRatedMovies = asyncHandler(async (req, res) => {
  try {
    const movies = await Movie.find().sort({ rate: -1 });
    if (!movies) {
      res.status(404).json({ message: "Movies not found" });
    } else {
      res.status(200).json(movies);
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

// get random movies
const getRandomMovies = asyncHandler(async (req, res) => {
  try {
    const movies = await Movie.aggregate([{ $sample: { size: 8 } }]);
    res.status(200).json(movies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// create movie review
const createMovieReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const alreadyReviewed = movie.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this movie" });
    }

    const review = {
      userName: req.user.fullName,
      user: req.user._id,
      userImage: req.user.image || "",
      rating: Number(rating),
      comment,
    };

    // Push review to reviews array
    movie.reviews.push(review);

    // Increase number of reviews
    movie.numberOfReviews = movie.reviews.length;

    // Calculate average rating
    movie.rate =
      movie.reviews.reduce((acc, item) => item.rating + acc, 0) /
      movie.reviews.length;

    await movie.save();

    res.status(201).json({ message: "Review added" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- ADMIN CONTROLLER --- //

// update movie

const updateMovie = asyncHandler(async (req, res) => {
  // get data from body
  try {
    const {
      name,
      desc,
      image,
      titleImage,
      category,
      numberOfReviews,
      language,
      year,
      video,
      casts,
      rate,
    } = req.body;

    // find movie in db
    const movie = await Movie.findById(req.params.id);

    if (movie) {
      movie.name = name || movie.name;
      movie.desc = desc || movie.desc;
      movie.image = image || movie.image;
      movie.titleImage = titleImage || movie.titleImage;
      movie.category = category || movie.category;
      movie.numberOfReviews = numberOfReviews || movie.numberOfReviews;
      movie.language = language || movie.language;
      movie.year = year || movie.year;
      movie.video = video || movie.video;
      movie.casts = casts || movie.casts;
      movie.rate = rate || movie.rate;

      const updatedMovie = await movie.save();
      res.status(200).json(updatedMovie);
    } else {
      res.status(404).json({ message: "Movie not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete movie
const deleteMovie = asyncHandler(async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      await Movie.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Delete movie successfully" });
    } else {
      res.status(404).json({ message: "Movie not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete all movies
const deleteAllMovies = asyncHandler(async (req, res) => {
  try {
    await Movie.deleteMany({});
    res.status(200).json({ message: "Delete all movies successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// create movie
const createMovie = asyncHandler(async (req, res) => {
  try {
    const existedMovie = await Movie.findOne({ name: req.body.name });
    if (existedMovie) {
      return res.status(400).json({ message: "Movie already exists" });
    }
    const {
      name,
      desc,
      image,
      titleImage,
      category,
      numberOfReviews,
      language,
      year,
      time,
      video,
      casts,
      rate,
    } = req.body;
    const movie = await Movie.create({
      name,
      desc,
      image,
      titleImage,
      category,
      numberOfReviews,
      language,
      year,
      video,
      casts,
      time,
      rate,
      userId: req.user._id,
    });

    // save the movie
    if (movie) {
      const createdMovie = await movie.save();
      res.status(201).json(createdMovie);
    } else {
      res.status(400).json({ message: "Invalid movie data" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
export {
  importMovies,
  getMovies,
  getMovie,
  getTopRatedMovies,
  getRandomMovies,
  createMovieReview,
  updateMovie,
  deleteMovie,
  deleteAllMovies,
  createMovie,
};
