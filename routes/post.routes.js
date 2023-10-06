const express = require('express');
const router = express.Router();
const Post = require('../models/Post.model');
const fileUploader = require('../config/cloudinary.config');
const { isAuthenticated } = require('../middleware/jwt.middleware');
const User = require('../models/User.model');

router.get('/dashboard', (req, res, next) => {
  if (!req.payload) {
    return res.status(400).send('Unauthorized');
  }
  Post.find({ author: req.payload._id })
    .then((dashboard) => {
      res.json(dashboard);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/create-post', (req, res, next) => {
  const { coverImg, title, location, content, author } = req.body;
  Post.create({ coverImg, title, location, content, author })
    .then((newPost) => {
      console.log('newpost', newPost);
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
  Post.find()
    .populate('author')
    .then((postsFromDB) => {
      postsFromDB.forEach((post) => {
        if (!post.author) {
          console.log('Missing author for post with _id:', post._id);
        }
      });

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

router.get('/user-posts/:id', (req, res, next) => {
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

router.post('/update-user-profile-pic', (req, res) => {
  const { userId, profilePicUrl } = req.body;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.profilePicUrl = profilePicUrl;
      return user.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Profile picture updated successfully' });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error updating profile picture' });
    });
});

module.exports = router;
