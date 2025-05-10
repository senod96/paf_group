import React, { useEffect, useState } from "react";
import AddComment from "./AddComment";
import CommentList from "./CommentList";
import PostSlider from "./PostSlider";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Grid,
  Button,
  Modal,
  TextField,
} from "@mui/material";

const HomePostList = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored?.startsWith("{")) return JSON.parse(stored);
      return { id: stored };
    } catch {
      return null;
    }
  });

  const currentUserId = user?.id || "";

  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [commentRefresh, setCommentRefresh] = useState({});
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [expandedMedia, setExpandedMedia] = useState(null);

  const [reshareModalOpen, setReshareModalOpen] = useState(false);
  const [reshareTargetPost, setReshareTargetPost] = useState(null);
  const [reshareComment, setReshareComment] = useState("");

  const fetchCommentsCount = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/comments/post/${postId}`);
      const data = await res.json();
      return data.length;
    } catch (err) {
      console.error("Error fetching comment count:", err);
      return 0;
    }
  };

  const fetchAllPosts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/posts");
      const postsData = await res.json();
      const visiblePosts = postsData.filter((post) => post.userId !== currentUserId);
      setPosts(visiblePosts);

      const counts = await Promise.all(
        visiblePosts.map((post) => fetchCommentsCount(post.postId))
      );

      const countMap = {};
      const refreshMap = {};
      visiblePosts.forEach((post, idx) => {
        countMap[post.postId] = counts[idx];
        refreshMap[post.postId] = 0;
      });

      setCommentCounts(countMap);
      setCommentRefresh(refreshMap);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/like`, {
        method: "PUT",
      });
      const updatedPost = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.postId === postId ? { ...p, likes: updatedPost.likes } : p))
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleReshareOpen = (post) => {
    setReshareTargetPost(post);
    setReshareComment("");
    setReshareModalOpen(true);
  };

  const handleReshareConfirm = async () => {
    if (!reshareTargetPost) return;

    const resharedPost = {
      ...reshareTargetPost,
      postId: undefined,
      userId: currentUserId,
      date: new Date().toISOString(),
      description: `${reshareComment}\n\nReshared from ${reshareTargetPost.userId}: ${reshareTargetPost.description}`,
      likes: 0,
    };

    try {
      const res = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resharedPost),
      });

      if (res.ok) {
        alert("Post reshared successfully!");
        setReshareModalOpen(false);
        fetchAllPosts();
      } else {
        console.error("Failed to reshare:", await res.text());
      }
    } catch (err) {
      console.error("Error resharing post:", err);
    }
  };

  const openCommentPopup = (postId) => setOpenCommentPostId(postId);
  const closeCommentPopup = () => setOpenCommentPostId(null);

  const handleCommentAdded = (postId) => {
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
    setCommentRefresh((prev) => ({
      ...prev,
      [postId]: prev[postId] + 1,
    }));
  };

  return (
    <Box sx={{ mt: 4, maxWidth: "600px", mx: "auto" }}>
    
      <Grid container spacing={3} direction="column">
        {posts.map((post) => (
          <Grid item xs={12} key={post.postId}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              {post.videoUrl ? (
                <Box onClick={() => setExpandedMedia({ type: "video", content: post.videoUrl })}>
                  <CardMedia
                    component="video"
                    src={post.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    sx={{ height: 500 }}
                  />
                </Box>
              ) : post.imageUrls?.length > 1 ? (
                <Box onClick={() => setExpandedMedia({ type: "slider", content: post.imageUrls })}>
                  <PostSlider images={post.imageUrls} />
                </Box>
              ) : post.imageUrls?.length === 1 ? (
                <Box onClick={() => setExpandedMedia({ type: "image", content: post.imageUrls[0] })}>
                  <CardMedia
                    component="img"
                    src={post.imageUrls[0]}
                    alt="Post image"
                    sx={{ height: 500, objectFit: "cover" }}
                  />
                </Box>
              ) : (
                <CardMedia
                  component="img"
                  src="https://via.placeholder.com/800x300?text=No+Media"
                  alt="No media"
                />
              )}

              <CardContent>
                <Typography variant="h6">{post.post}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {post.description}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleLike(post.postId)}
                  >
                    ❤️ {post.likes}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => openCommentPopup(post.postId)}
                  >
                    💬 {commentCounts[post.postId] || 0}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleReshareOpen(post)}
                  >
                    🔁 Reshare
                  </Button>
                </Box>

                <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                  By: {post.userId} | Date: {post.date}
                </Typography>

                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {post.tags?.map((tag, i) => (
                    <Chip key={i} label={tag} variant="outlined" size="small" />
                  ))}
                </Box>

                <CommentList
                  postId={post.postId}
                  refreshTrigger={commentRefresh[post.postId] || 0}
                />
              </CardContent>
            </Card>

            <Modal
              open={openCommentPostId === post.postId}
              onClose={closeCommentPopup}
              aria-labelledby="add-comment-popup"
              sx={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 600,
                  bgcolor: "background.paper",
                  borderRadius: "12px 12px 0 0",
                  boxShadow: 24,
                  p: 2,
                  mb: 1,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Add Comment
                </Typography>
                <AddComment
                  postId={post.postId}
                  onCommentAdded={() => {
                    fetchCommentsCount(post.postId);
                    closeCommentPopup();
                  }}
                />
              </Box>
            </Modal>
          </Grid>
        ))}
      </Grid>

      {/* Reshare Modal */}
      <Modal open={reshareModalOpen} onClose={() => setReshareModalOpen(false)}>
        <Box
          sx={{
            maxWidth: 600,
            mx: "auto",
            mt: "10vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add your comment
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Add a comment to your reshare..."
            value={reshareComment}
            onChange={(e) => setReshareComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" fullWidth onClick={handleReshareConfirm}>
            Confirm Reshare
          </Button>
        </Box>
      </Modal>

      {/* Expanded Media Modal */}
      <Modal
        open={!!expandedMedia}
        onClose={() => setExpandedMedia(null)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            width: "90%",
            maxWidth: 1000,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
          }}
        >
          {expandedMedia?.type === "video" && (
            <video
              src={expandedMedia.content}
              controls
              autoPlay
              loop
              muted
              style={{ width: "100%", objectFit: "contain" }}
            />
          )}
          {expandedMedia?.type === "image" && (
            <img
              src={expandedMedia.content}
              alt="Expanded"
              style={{ width: "100%", objectFit: "contain" }}
            />
          )}
          {expandedMedia?.type === "slider" && (
            <PostSlider images={expandedMedia.content} />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePostList;
