import React, { useEffect, useState } from "react";
import coursePfp from "./course.webp"; // Make sure this image exists

const CommentList = ({ postId, refreshTrigger = 0 }) => {
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

    fetchComments();
  }, [postId, refreshTrigger]);

  const visibleComments = expanded ? comments : comments.slice(0, 3);
  const hasMore = comments.length > 3;

  return (
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
              >
                <img
                  src={coursePfp}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-[15px] text-gray-800 dark:text-gray-100 font-medium">
                    {comment.comment}
                  </p>
                  <div className="text-[13px] text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-1">
                    <span>👍 {comment.likes}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {expanded ? "Show less" : "See more comments"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CommentList;
