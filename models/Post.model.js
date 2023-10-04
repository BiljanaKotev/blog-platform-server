const { Schema, model } = require('mongoose');

const postSchema = new Schema(
  {
    coverImg: {
      type: String,
      required: [true, 'Image is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required.'],
    },
    location: {
      type: String,
      required: [true, 'Location is required.'],
    },
    content: {
      type: String,
      required: [true, 'Content is required.'],
    },
    author: {
      type: String,
      required: [true, 'Description is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Post = model('Post', postSchema);

module.exports = Post;
