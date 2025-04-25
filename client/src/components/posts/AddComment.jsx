import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns"; // Import the function to format the timestamp

// Function to format the timestamp using date-fns
function formatTimestamp(dateString) {
  const date = new Date(dateString);
  return formatDistanceToNow(date) + " ago"; // Format and return as "x ago"
}

const AddComment = ({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [formVisible, setFormVisible] = useState(true); 

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser?.startsWith("{")) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user?.id || "");
    } else {
      setCurrentUserId(storedUser || "");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setErrorMessage("Comment cannot be empty!");
      return;
    }

    const newComment = {
      postId,
      comment,
      commentorId: currentUserId, 
      likes: 0,
      timestamp: new Date().toISOString(), // Add the timestamp for the new comment
    };

    try {
      const res = await fetch("http://localhost:8080/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setComment(""); 
      setSuccessMessage("✅ Comment added successfully!"); 
      setErrorMessage(""); 
      setFormVisible(false); 

      if (onCommentAdded) onCommentAdded(); 

      setTimeout(() => {
        setSuccessMessage(""); 
      }, 5000); 
    } catch (err) {
      console.error("Error adding comment:", err);
      setErrorMessage("Failed to add comment. Please try again.");
      setSuccessMessage(""); 
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input type="hidden" value={currentUserId} />
      {formVisible && (
        <>
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
        </>
      )}

      {successMessage && (
        <div style={{ marginTop: "10px", color: "green", fontSize: "14px", fontWeight: "bold" }}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ marginTop: "10px", color: "red", fontSize: "14px", fontWeight: "bold" }}>
          {errorMessage}
        </div>
      )}
    </form>
  );
};

export default AddComment;
