const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post.model');

router.get('/dashboard', (req, res, next) => {
  console.log('Dashboard accessed');
  if (!req.user) {
    return res.status(400).send('Unauthorized');
  }
  Post.find({ userId: req.user._id })
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
