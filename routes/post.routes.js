const express = require('express');
const router = express.Router();
const Post = require('../models/Post.model');
const fileUploader = require('../config/cloudinary.config');
const { isAuthenticated } = require('../middleware/jwt.middleware');

router.get('/dashboard', (req, res, next) => {
  if (!req.payload) {
    return res.status(400).send('Unauthorized');
  }
  Post.find({ userId: req.payload._id })
    .then((dashboard) => {
      res.json(dashboard);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/create-post', (req, res, next) => {
  const { coverImg, title, location, content } = req.body;
  Post.create({ coverImg, title, location, content })
    .then((newPost) => {
      res.status(200).json(newPost);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/user-posts', (req, res, next) => {
  const userId = req.payload._id;
  Post.find({ author: userId })
    .populate('author')
    .then((userPosts) => {
      res.status(200).json(userPosts);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/blog-feed', (req, res, next) => {
  console.log('works');

  Post.find()
    .populate('author')
    .then((postsFromDB) => {
      res.status(200).json(postsFromDB);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/blog-feed/:id', (req, res, next) => {
  const postId = req.params.id;

  Post.findById(postId)
    .populate('author')
    .then((postFromDB) => {
      if (postFromDB) {
        res.status(200).json(postFromDB);
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/dashboard/blog-post/:id', (req, res, next) => {
  const id = req.params.id;

  Post.findById(id)
    .populate('author')
    .then((dbPost) => {
      if (dbPost) {
        res.status(200).json(dbPost);
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/upload', fileUploader.single('imgUrl'), (req, res, next) => {
  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }
  const responseObject = { fileUrl: req.file.path };
  console.log('Server side fileUrl', responseObject);
  res.json({ fileUrl: req.file.path });
});

module.exports = router;
