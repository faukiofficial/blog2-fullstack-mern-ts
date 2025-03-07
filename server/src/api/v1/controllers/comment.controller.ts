import { Response } from "express";
import Comment from "../models/comment.model";
import Blog from "../models/blog.model";
import { populateBlog } from "./blog.controller";
import Reply from "../models/reply.model";

export const createComment = async (req: any, res: Response): Promise<any> => {
  try {
    const { blogId } = req.params;
    const { text } = req.body;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    const comment = new Comment({
      blog: blogId,
      user: req.user._id,
      text,
    });

    blog.comments && blog.comments.push(comment._id);
    await blog.save();

    await comment.save();

    const populatedBlog = await populateBlog(blog.slug);

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      blog: populatedBlog,
    });
  } catch (error) {
    console.log("Error creating comment", error);
    res.status(400).json({
      success: false,
      message: "Failed to create comment",
    });
  }
};

// like comment
export const likeComment = async (req: any, res: Response): Promise<any> => {
  try {
    const { commentId } = req.params;
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    comment.likes.push(req.user._id);
    await comment.save();

    const populatedBlog = await populateBlog(blog.slug);

    res.status(200).json({
      success: true,
      message: "Comment liked successfully",
      blog: populatedBlog,
    });
  } catch (error) {
    console.log("Error liking comment", error);
    res.status(400).json({
      success: false,
      message: "Failed to like comment",
    });
  }
};

// unlike comment
export const unlikeComment = async (req: any, res: Response): Promise<any> => {
  try {
    const { commentId } = req.params;
    const { blogId } = req.params;
    const { _id } = req.user;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    comment.likes = comment.likes.filter((like) => like.toString() !== _id.toString());
    await comment.save();

    const populatedBlog = await populateBlog(blog.slug);

    res.status(200).json({
      success: true,
      message: "Comment unliked successfully",
      blog: populatedBlog,
    });
  } catch (error) {
    console.log("Error unliking comment", error);
    res.status(400).json({
      success: false,
      message: "Failed to unlike comment",
    });
  }
};

// delete comment
export const deleteComment = async (req: any, res: Response): Promise<any> => {
  try {
    const { commentId } = req.params;
    const { blogId } = req.params;
    const { _id } = req.user;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    if (comment.user.toString() !== _id.toString()) {
      return res
        .status(401)
        .send({ message: "You are not authorized to delete this comment" });
    }

    await Reply.deleteMany({ comment: commentId });

    await Comment.findByIdAndDelete(commentId);

    blog.comments =
      blog.comments && blog.comments.filter((c) => c.toString() !== commentId);
    await blog.save();

    const populatedBlog = await populateBlog(blog.slug);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      blog: populatedBlog,
    });
  } catch (error) {
    console.log("Error deleting comment", error);
    res.status(400).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};
