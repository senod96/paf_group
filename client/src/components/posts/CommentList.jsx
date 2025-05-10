import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, TextField, IconButton, Menu, MenuItem } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import MoreVertIcon from '@mui/icons-material/MoreVert';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  return formatDistanceToNow(date) + " ago";
};

const CommentList = ({ postId, refreshTrigger, onCommentAdded, onCommentDeleted }) => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored?.startsWith("{")) {
        return JSON.parse(stored);
      } else {
        return { id: stored };
      }
    } catch {
      return null;
    }
  });

  const currentUserId = user?.id || "";
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [userEmails, setUserEmails] = useState({});
  const [replies, setReplies] = useState({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCommentId, setCurrentCommentId] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/comments/post/${postId}`);
        const data = await res.json();
        setComments(data);

        const fetchedEmails = {};
        for (const comment of data) {
          if (!fetchedEmails[comment.commentorId]) {
            const userRes = await fetch(`http://localhost:8080/api/users/${comment.commentorId}`);
            const userData = await userRes.json();
            fetchedEmails[comment.commentorId] = userData.email;
          }
        }
        setUserEmails(fetchedEmails);

        const repliesMap = {};
        data.forEach(comment => {
          repliesMap[comment.commentId] = comment.replies || [];
        });
        setReplies(repliesMap);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
  }, [postId, refreshTrigger]);


   // Fetch comments and replies on load
   useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/comments/post/${postId}`);
        const data = await res.json();
        setComments(data);

        // Organize replies
        const repliesMap = {};
        data.forEach(comment => {
          repliesMap[comment.commentId] = comment.replies || [];
        });
        setReplies(repliesMap);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
  }, [postId, refreshTrigger]);


  const deleteComment = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/comments/${commentToDelete}/${currentUserId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentToDelete)
      );

      setReplies((prevReplies) => {
        const newReplies = { ...prevReplies };
        delete newReplies[commentToDelete];
        return newReplies;
      });

      onCommentDeleted(postId);

      setOpenModal(false);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleDeleteConfirmation = (commentId) => {
    setCommentToDelete(commentId);
    setOpenModal(true);
  };

  const handleCancel = () => {
    setOpenModal(false);
    setIsEditing(false);
    setAnchorEl(null);
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleEditChange = (e) => {
    setEditingText(e.target.value);
  };

  const handleEditSubmit = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      const updatedComment = {
        ...comments.find((comment) => comment.commentId === commentId),
        comment: editingText,
      };

      const res = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedComment),
      });

      if (!res.ok) {
        throw new Error("Failed to update comment");
      }

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.commentId === commentId ? updatedComment : comment
        )
      );

      setIsEditing(false);
      setActiveCommentId(null);
      setAnchorEl(null);
      onCommentAdded(postId);
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const handleReplySubmit = async (parentCommentId, isReplyToReply = false) => {
    if (!replyText.trim()) return;

    const newReply = {
      postId,
      commentorId: currentUserId,
      comment: replyText,
      parentCommentId,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:8080/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReply),
      });

      if (!res.ok) {
        throw new Error("Failed to add reply");
      }

      setReplyText("");

      setReplies((prevReplies) => {
        const updatedReplies = { ...prevReplies };

        if (!updatedReplies[parentCommentId]) {
          updatedReplies[parentCommentId] = [];
        }

        updatedReplies[parentCommentId] = [
          ...updatedReplies[parentCommentId],
          newReply,
        ];

        return updatedReplies;
      });

      onCommentAdded(postId);
      setActiveReplyCommentId(null);
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const renderReplies = (parentCommentId, level = 1) => {
    return replies[parentCommentId]?.map((reply) => (
      <div
        key={reply.commentId}
        style={{
          marginLeft: `${level * 20}px`, // Indentation for nested replies
          padding: "10px",
          borderBottom: "1px solid #e0e0e0",
          borderRadius: "5px",
          backgroundColor: "#f0f0f0",
        }}
      >
<p>
  {reply.commentorId === currentUserId
    ? <strong>{userEmails[reply.commentorId] || 'You'}</strong>
    : (userEmails[reply.commentorId] ? userEmails[reply.commentorId] : reply.commentorId)}
</p>

  
        <p>{reply.comment}</p>
  
        <button
          onClick={() => handleReplySubmit(reply.commentId, true)} // Reply to a reply
          style={{
            marginLeft: "10px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#1e5ff4",
          }}
        >
          Reply
        </button>
  
        {/* Recursively render replies to replies */}
        {replies[reply.commentId] && renderReplies(reply.commentId, level + 1)}
      </div>
    ));
  };
  



//////////////////////////////////////////////////////
  const CommentList = ({ postId, refreshTrigger, onCommentAdded, onCommentDeleted }) => {
    const [user] = useState(() => {
      try {
        const stored = localStorage.getItem("user");
        if (stored?.startsWith("{")) {
          return JSON.parse(stored);
        } else {
          return { id: stored };
        }
      } catch {
        return null;
      }
    });
  
    const currentUserId = user?.id || "";
    const [comments, setComments] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [replies, setReplies] = useState({});
    const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  
   


/////////////////////////////////////////////////
    const renderReplies = (parentCommentId, level = 1) => {
      return replies[parentCommentId]?.map((reply) => (
        <div
          key={reply.commentId}
          style={{
            marginLeft: `${level * 20}px`, // Indentation for nested replies
            padding: "10px",
            borderBottom: "1px solid #e0e0e0",
            borderRadius: "5px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <p>
            {reply.commentorId === currentUserId
              ? <strong>{userEmails[reply.commentorId]} .You</strong>
              : userEmails[reply.commentorId] || "Loading..."}
          </p>
    
          <p>{reply.comment}</p>
    
          <button
            onClick={() => handleReplySubmit(reply.commentId, true)} // Reply to a reply
            style={{
              marginLeft: "10px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#1e5ff4",
            }}
          >
            Reply
          </button>
    
          {/* Recursively render replies to replies */}
          {replies[reply.commentId] && renderReplies(reply.commentId, level + 1)}
        </div>
      ));
    };
    
/////////////////////////////////////////////////

  
  };
  




  
/////////////////////////////////////////////////


  const handleLikeReply = async (replyId) => {
    const replyToUpdate = replies.flatMap(reply => reply).find(reply => reply.commentId === replyId);
    if (!replyToUpdate) return;

    const updatedReply = { ...replyToUpdate, likes: replyToUpdate.likes + 1 };

    const updatedReplies = { ...replies };
    updatedReplies[replyToUpdate.parentCommentId] = updatedReplies[replyToUpdate.parentCommentId].map(reply =>
      reply.commentId === replyId ? updatedReply : reply
    );

    setReplies(updatedReplies);
  };

  const toggleCommentsVisibility = () => {
    setIsCommentsVisible(prevState => !prevState);
  };

  const handleMoreClick = (event, commentId) => {
    setAnchorEl(event.currentTarget);
    setCurrentCommentId(commentId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <div style={{ marginTop: "10px", fontSize: "14px", padding: "20px" }}>
      <h4>Post</h4>
      <button
        onClick={toggleCommentsVisibility}
        style={{
          marginBottom: "20px",
          backgroundColor: "#1E5FF4",
          color: "white",
          border: "none",
          cursor: "pointer",
          padding: "5px 10px",
          borderRadius: "5px"
        }}
      >
        {isCommentsVisible ? "Hide Comments" : "Show Comments"}
      </button>

      {isCommentsVisible && (
        <div>
          <h4>Comments</h4>
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            <div>
              {comments.map((comment) => (
                <div
                  key={comment.commentId}
                  style={{
                    marginBottom: "20px",
                    padding: "10px",
                    borderBottom: "1px solid #e0e0e0",
                    borderRadius: "5px",
                    backgroundColor: "#fafafa",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <strong>{comment.username}</strong>
                    <span style={{ marginLeft: "10px", fontSize: "12px", color: "gray" }}>
                      {formatTimestamp(comment.timestamp)}
                    </span>
                    <span
                      style={{
                        marginLeft: "10px",
                        fontSize: "12px",
                        color: comment.commentorId === currentUserId ? "#1e5ff4" : "gray",
                        fontWeight: comment.commentorId === currentUserId ? "bold" : "normal",
                      }}
                    >
                      {comment.commentorId === currentUserId
                        ? `${userEmails[comment.commentorId]}  .You`
                        : userEmails[comment.commentorId] || "Loading..."}
                    </span>
                  </div>

                  <p style={{ marginBottom: "10px", lineHeight: "1.5" }}>
                    {isEditing && activeCommentId === comment.commentId ? (
                      <div>
                        <TextField
                          value={editingText}
                          onChange={handleEditChange}
                          fullWidth
                          multiline
                          rows={4}
                        />
                        <button
                          onClick={() => handleEditSubmit(comment.commentId)}
                          style={{
                            backgroundColor: "#1E5FF4",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            padding: "5px 10px",
                            borderRadius: "5px",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span>{comment.comment}</span>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditingText(comment.comment);
                            setActiveCommentId(comment.commentId);
                          }}
                          style={{
                            backgroundColor: "#1E5FF4",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            padding: "5px 10px",
                            borderRadius: "5px",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </p>

                  {/* Like Button */}
                  <button
                    style={{
                      marginLeft: "10px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#1e5ff4",
                    }}
                  >
                    ❤️ {comment.likes}
                  </button>

                  {/* Reply Button */}
                  <button
                    onClick={() => {
                      setActiveReplyCommentId(comment.commentId);
                    }}
                    style={{
                      marginLeft: "10px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#1e5ff4",
                    }}
                  >
                    Reply
                  </button>

                  {/* Reply input */}
                  {activeReplyCommentId === comment.commentId && (
                    <div style={{ marginTop: "10px", paddingLeft: "20px" }}>
                      <textarea
                        value={replyText}
                        onChange={handleReplyChange}
                        placeholder="Write a reply..."
                        rows="3"
                        style={{ width: "100%", padding: "10px", borderRadius: "6px" }}
                      />
                      <button
                        onClick={() => handleReplySubmit(comment.commentId)}
                        style={{
                          marginTop: "10px",
                          backgroundColor: "#1E5FF4",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          padding: "5px 10px",
                          borderRadius: "5px",
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  )}

                  {/* More Options button for editing/deleting */}
                  {comment.commentorId === currentUserId && (
                    <IconButton
                      onClick={(e) => handleMoreClick(e, comment.commentId)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}

                  {/* Dropdown Menu for Edit/Delete */}
                  <Menu
                    anchorEl={anchorEl}
                    open={currentCommentId === comment.commentId}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem
                      onClick={() => {
                        setIsEditing(true);
                        setEditingText(comment.comment);
                        setActiveCommentId(comment.commentId);
                        handleCloseMenu();
                      }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDeleteConfirmation(comment.commentId);
                        handleCloseMenu();
                      }}
                    >
                      Delete
                    </MenuItem>
                  </Menu>

                  {/* Replies */}
                  {replies[comment.commentId] && replies[comment.commentId].map((reply) => (
                    <div
                      key={reply.commentId}
                      style={{
                        marginLeft: "20px",
                        padding: "10px",
                        borderBottom: "1px solid #e0e0e0",
                        borderRadius: "5px",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <p>
                        {reply.commentorId === currentUserId
                          ? <strong>{userEmails[reply.commentorId]} .You</strong>
                          : userEmails[reply.commentorId] || "Loading..."}
                      </p>

                      <p>{reply.comment}</p>

                      <button
                        onClick={() => handleLikeReply(reply.commentId)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#1e5ff4",
                        }}
                      >
                        ❤️ {reply.likes || 0}
                      </button>

                      {/* Reply to Reply */}
                      <button
                        onClick={() => {
                          setActiveReplyCommentId(reply.commentId);
                        }}
                        style={{
                          marginLeft: "10px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#1e5ff4",
                        }}
                      >
                        Reply
                      </button>

                      {activeReplyCommentId === reply.commentId && (
                        <div style={{ marginTop: "10px", paddingLeft: "20px" }}>
                          <textarea
                            value={replyText}
                            onChange={handleReplyChange}
                            placeholder="Write a reply..."
                            rows="3"
                            style={{ width: "100%", padding: "10px", borderRadius: "6px" }}
                          />
                          <button
                            onClick={() => handleReplySubmit(reply.commentId, true)}
                            style={{
                              marginTop: "10px",
                              backgroundColor: "#1E5FF4",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              padding: "5px 10px",
                              borderRadius: "5px",
                            }}
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={openModal}
        onClose={handleCancel}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            width: 400,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Are you sure you want to delete your comment?
            <br />
            <strong>All likes and replies on this comment will also be removed.</strong>
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "center" }}>
            <Button variant="outlined" color="primary" onClick={deleteComment}>
              Yes
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default CommentList;

