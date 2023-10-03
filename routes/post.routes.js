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

router.post('/blog-post', (req, res, next) => {
  console.log('accessed new post');
  const { coverImg, title, location, description } = req.body;
  Post.create({ coverImg, title, location, description })
    .then((post) => {
      res.json(post);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
