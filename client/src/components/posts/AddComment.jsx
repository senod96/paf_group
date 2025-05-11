import React, { useState, useEffect } from "react";

const AddComment = ({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const id = stored?.startsWith("{") ? JSON.parse(stored).id : stored;
    setUserId(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      console.error("User ID not found in localStorage.");
      return;
    }

    const newComment = {
      postId,
      comment,
      commentorId: userId,
      likes: 0,
    };

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setComment("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
        required
      />
      <button
        type="submit"
        disabled={loading || comment.trim() === ""}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold py-2 px-4 rounded-full transition"
      >
        {loading ? "Sending..." : "Post"}
      </button>
    </form>
  );
};

export default AddComment;
