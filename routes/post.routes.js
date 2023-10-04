const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post.model');

router.get('/dashboard', (req, res, next) => {
  if (!req.user) {
    return res.status(400).send('Unauthorized');
  }
  Post.find({ userId: req.user._id })
    .then((dashboard) => {
      res.json(dashboard);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/create-post', (req, res, next) => {
  console.log('accessed new post');
  const { coverImg, title, location, content } = req.body;
  Post.create({ coverImg, title, location, content })
    .then((newPost) => {
      res.json(newPost);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/blog-feed', (req, res, next) => {
  console.log('works');
  const { coverImg, title, author } = req.body;
  Post.create({ coverImg, title, author })
    .then((postFeed) => {
      res.json(postFeed);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
