const express = require('express');
const router = express.Router();
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const Comment = require('../models/Comment.model');
const fileUploader = require('../config/cloudinary.config');
const { isAuthenticated } = require('../middleware/jwt.middleware');

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
  console.log('Incoming data:', req.body);

  const { coverImg, title, location, content, author } = req.body;

  Post.create({ coverImg, title, location, content, author })
    .then((newPost) => {
      console.log('newpost', newPost);
      res.status(200).json(newPost);
    })
    .catch((err) => {
      console.error('Error:', err);
      next(err);
    });
});

router.get('/user-posts', (req, res, next) => {
  const userId = req.payload._id;
  Post.find({ author: userId })
    .populate('author')
    .then((userPosts) => {
      if (userPosts) {
        res.status(200).json(userPosts);
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    })
    .catch((err) => {
      next(err);
    });
});

// DELETE USER BLOG POST
router.delete('/user-posts/:id', (req, res, next) => {
  const { id } = req.params;
  Post.findByIdAndDelete(id)
    .then((userPost) => {
      if (userPost) {
        res.status(200).json({ message: 'Post deleted successfully' });
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    })
    .catch((err) => {
      next(err);
    });
});

// EDIT USER BLOG POST
router.put('/user-posts/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, coverImg } = req.body;

  Post.findByIdAndUpdate(id, { title, content, coverImg }, { new: true })
    .then((updatedPost) => {
      res.json(updatedPost);
    })
    .catch((err) => {
      next(err);
    });
});

// RETRIEVE SINGLE BLOG POST
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

// RETRIEVE COMMENTS FROM SINGLE BLOG POST
router.get('/blog-feed/:id/comments', (req, res, next) => {
  const postId = req.params.id;

  Comment.find({ post: postId })
    .populate('author')
    .then((comments) => {
      res.status(200).json(comments);
    })
    .catch((err) => {
      next(err);
    });
});

// RETRIEVE SINGLE BLOG POST FROM BLOG FEED
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

// FOR POSTING COMMENTS ON INDIVIDUAL BLOG POSTS
router.post('/blog-feed/:id/comments', (req, res, next) => {
  const postId = req.params.id;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const commentData = {
        post: postId,
        author: req.payload._id,
        text: req.body.text,
      };

      return Comment.create(commentData);
    })
    .then((comment) => {
      return Comment.populate(comment, { path: 'author' });
    })
    .then((populatedComment) => {
      res.status(200).json(populatedComment);
    })
    .catch((err) => {
      next(err);
    });
});

// EDIT USER COMMENT
router.put('/blog-feed/:postId/comments/:commentId', (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;

  Comment.findByIdAndUpdate(commentId, { text }, { new: true })
    .then((updatedComment) => {
      if (!updatedComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      res.json(updatedComment);
    })
    .catch((err) => {
      next(err);
    });
});

// DELETE USER COMMENT
router.delete('/blog-feed/:postId/comments/:commentId', (req, res, next) => {
  const { commentId } = req.params;

  Comment.findByIdAndDelete(commentId)
    .then((userComment) => {
      if (userComment) {
        res.status(200).json({ message: 'Comment deleted successfully' });
      } else {
        res.status(404).json({ message: 'Comment not found' });
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/upload', fileUploader.single('imgUrl'), (req, res, next) => {
  console.error('No file uploaded!');
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  const responseObject = { fileUrl: req.file.path };
  console.log('Server side fileUrl', responseObject);
  res.json({ fileUrl: req.file.path });
});

// UPLOADING USER PROFILE PIC TO DASHBOARD

router.post('/update-user-profile-pic', (req, res) => {
  console.log('Reached /upload route');
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
