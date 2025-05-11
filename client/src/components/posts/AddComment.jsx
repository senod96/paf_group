import React, { useState, useEffect } from "react";

const AddComment = ({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState("");

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
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 font-sans text-lg"
    >
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
        className="p-3 border border-gray-300 rounded-lg text-gray-800"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
      >
        Send Comment
      </button>
    </form>
  );
};

export default AddComment;
