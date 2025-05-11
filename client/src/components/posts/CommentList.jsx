import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import coursePfp from "./course.webp"; // Ensure this image exists in the same folder

const CommentList = ({ postId, show = true, onClose = () => {}, refreshTrigger = 0 }) => {
=======
import coursePfp from "./course.webp"; // Make sure this image exists

const CommentList = ({ postId, refreshTrigger = 0 }) => {
>>>>>>> main
  const [comments, setComments] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/comments/post/${postId}`);
        const data = await res.json();
        setComments(data);
        setExpanded(false);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

<<<<<<< HEAD
    if (show) fetchComments();
  }, [postId, refreshTrigger, show]);

  if (!show) return null;
=======
    fetchComments();
  }, [postId, refreshTrigger]);
>>>>>>> main

  const visibleComments = expanded ? comments : comments.slice(0, 3);
  const hasMore = comments.length > 3;

  return (
<<<<<<< HEAD
    <div className="mt-5 font-sans relative bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-800 dark:to-gray-900 dark:text-white rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition text-sm"
      >
        ✖
      </button>

      <h4 className="text-xl font-semibold text-blue-700 dark:text-indigo-300 mb-4">💬 Comments</h4>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {visibleComments.map((comment) => (
              <li
                key={comment.commentId}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 shadow-sm flex items-start gap-3"
=======
    <div className="mt-6">
      {comments.length === 0 ? (
        <p className="text-base text-gray-600 dark:text-gray-400">No comments yet.</p>
      ) : (
        <>
          <ul className="space-y-5">
            {visibleComments.map((comment) => (
              <li
                key={comment.commentId}
                className="flex items-start gap-4"
>>>>>>> main
              >
                <img
                  src={coursePfp}
                  alt="profile"
<<<<<<< HEAD
                  className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-500"
                />
                <div className="flex justify-between items-start w-full">
                  <span className="text-sm text-gray-800 dark:text-gray-200">{comment.comment}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-3 whitespace-nowrap">
                    ❤️ {comment.likes}
                  </span>
=======
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-[15px] text-gray-800 dark:text-gray-100 font-medium">
                    {comment.comment}
                  </p>
                  <div className="text-[13px] text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-1">
                    <span>👍 {comment.likes}</span>
                  </div>
>>>>>>> main
                </div>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
<<<<<<< HEAD
              className="mt-4 text-sm text-blue-600 dark:text-indigo-400 hover:underline"
            >
              {expanded ? "Show less" : "See more"}
=======
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {expanded ? "Show less" : "See more comments"}
>>>>>>> main
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CommentList;
