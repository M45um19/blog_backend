const express = require('express');
const Comment = require('../models/Comment');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// নতুন কমেন্ট তৈরি
router.post('/:postId', async (req, res) => {
  try {
    const { text, author } = req.body;
    const comment = new Comment({
      post: req.params.postId,
      text,
      author: author || 'Anonymous'
    });
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Error creating comment' });
  }
});

// নির্দিষ্ট পোস্টের সব কমেন্ট আনা
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

router.delete('/:commentId', verifyToken, isAdmin, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
