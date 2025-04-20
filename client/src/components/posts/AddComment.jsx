import React, { useState } from "react";

const AddComment = ({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState("");
  const [commentorId, setCommentorId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newComment = {
      postId,
      comment,
      commentorId,
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
      setCommentorId("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        value={commentorId}
        onChange={(e) => setCommentorId(e.target.value)}
        placeholder="Your ID"
        style={{ padding: "10px", borderRadius: "6px" }}
        required
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        rows={2}
        style={{ padding: "10px", borderRadius: "6px" }}
        required
      />
      <button type="submit" style={{ padding: "8px", marginTop: "8px" }}>
        Send
      </button>
    </form>
  );
};

export default AddComment;
