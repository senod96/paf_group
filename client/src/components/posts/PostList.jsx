import React, { useEffect, useState } from "react";
import AddComment from "./AddComment";
import CommentList from "./CommentList";
import PostSlider from "./PostSlider";
import UpdatePost from "./UpdatePost";
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
} from "@mui/material";

const PostList = () => {
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
  const [editingPostId, setEditingPostId] = useState(null);

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
      const userPosts = postsData.filter((post) => post.userId === currentUserId);
      setPosts(userPosts);

      const counts = await Promise.all(userPosts.map((post) => fetchCommentsCount(post.postId)));

      const countMap = {};
      const refreshMap = {};
      userPosts.forEach((post, idx) => {
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

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await fetch(`http://localhost:8080/api/posts/${postId}`, {
          method: "DELETE",
        });
        setPosts((prev) => prev.filter((p) => p.postId !== postId));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/like`, {
        method: "PUT",
      });
      const updatedPost = await res.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.postId === postId ? { ...post, likes: updatedPost.likes } : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

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

  const handleEditSuccess = () => {
    setEditingPostId(null);
    fetchAllPosts();
  };

  return (
    <Box sx={{ mt: 4, maxWidth: "600px", mx: "auto" }}>
     
      <Grid container spacing={3} direction="column">
        {posts.map((post) => (
          <Grid item xs={12} key={post.postId}>
            {editingPostId === post.postId ? (
              <UpdatePost postId={post.postId} onUpdateSuccess={handleEditSuccess} />
            ) : (
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                {/* Media Display */}
                {post.videoUrl ? (
                  <CardMedia
                    component="video"
                    src={post.videoUrl}
                    autoPlay
                    loop
                    muted
                    sx={{ height: 400 }}
                  />
                ) : post.imageUrls?.length > 1 ? (
                  <PostSlider images={post.imageUrls} />
                ) : post.imageUrls?.length === 1 ? (
                  <CardMedia
                    component="img"
                    src={post.imageUrls[0]}
                    alt="Post image"
                    sx={{ height: 400, objectFit: "cover" }}
                  />
                ) : (
                  <CardMedia
                    component="img"
                    src="https://via.placeholder.com/800x300?text=No+Media"
                    alt="No media"
                  />
                )}

                {/* Post Content */}
                <CardContent>
                  {post.resharedComment && (
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontStyle: "italic", color: "gray" }}
                    >
                      {post.resharedComment}
                    </Typography>
                  )}

                  {post.originalUserId && (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "block", mb: 1 }}
                    >
                      Originally posted by: {post.originalUserId}
                    </Typography>
                  )}

                  <Typography variant="h6">{post.post}</Typography>

                  {post.description?.includes("Reshared from") ? (
  <>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line", mt: 1 }}>
                   {post.description.split("Reshared from")[0].trim()}
                </Typography>
                 <Typography variant="body2" sx={{ color: "gray", mt: 1 }}>
                 🔁 from {post.description.split("Reshared from")[1]?.replace("test-user-id:", "").trim()}
                   </Typography>
                  </>
) : (
  <Typography variant="body2" sx={{ mt: 1 }}>
    {post.description}
  </Typography>
)}


                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Button variant="outlined" onClick={() => handleLike(post.postId)}>
                      ❤️ {post.likes}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setOpenCommentPostId(post.postId)}
                    >
                      💬 {commentCounts[post.postId] || 0}
                    </Button>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1 }}
                    color="text.secondary"
                  >
                    {post.date}
                  </Typography>

                  <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {post.tags?.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" />
                    ))}
                  </Box>

                  <CommentList
                    postId={post.postId}
                    refreshTrigger={commentRefresh[post.postId] || 0}
                  />

                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setEditingPostId(post.postId)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(post.postId)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Comment Modal */}
            <Modal
              open={openCommentPostId === post.postId}
              onClose={() => setOpenCommentPostId(null)}
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
                  onCommentAdded={() => handleCommentAdded(post.postId)}
                />
              </Box>
            </Modal>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PostList;
