const express = require('express');
const router = express.Router();
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');

// RETRIEVE SINGLE COMMENT FROM A BLOG POST
router.get('/blog-feed/:postId/comments/:commentId', (req, res, next) => {
  const { postId, commentId } = req.params;

  Comment.findOne({ _id: commentId, post: postId })
    .populate('author')
    .then((comment) => {
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      res.status(200).json(comment);
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
      che;
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

// FOR POSTING COMMENTS ON INDIVIDUAL BLOG POSTS
router.post('/blog-feed/:id/comments', (req, res, next) => {
  console.log('Payload:', req.payload);
  if (!req.payload || !req.payload._id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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

module.exports = router;
