const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Text is required for the comment.'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = model('Comment', commentSchema);

module.exports = Comment;
