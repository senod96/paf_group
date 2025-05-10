// All imports remain the same
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
  Button,
  Modal,
  TextField,
} from "@mui/material";
import profileImg from "./pfp.jpg";

const HomePostList = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored?.startsWith("{") ? JSON.parse(stored) : { id: stored };
    } catch {
      return null;
    }
  });

  const currentUserId = user?.id || "";
  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [commentRefresh, setCommentRefresh] = useState({});
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [reshareModalOpen, setReshareModalOpen] = useState(false);
  const [reshareTargetPost, setReshareTargetPost] = useState(null);
  const [reshareComment, setReshareComment] = useState("");
  const [expandedMedia, setExpandedMedia] = useState(null);

  const fetchCommentsCount = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/comments/post/${postId}`);
      const data = await res.json();
      return data.length;
    } catch {
      return 0;
    }
  };

  const fetchAllPosts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/posts");
      const data = await res.json();
      const visiblePosts = data.filter((p) => p.userId !== currentUserId);
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
      console.error("Error loading posts", err);
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
      const updated = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.postId === postId ? { ...p, likes: updated.likes } : p))
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleReshareOpen = (post) => {
    setReshareTargetPost(post);
    setReshareComment("");
    setReshareModalOpen(true);
  };

  const handleReshareConfirm = async () => {
    if (!reshareTargetPost) return;
    const newPost = {
      ...reshareTargetPost,
      postId: undefined,
      userId: currentUserId,
      date: new Date().toISOString(),
      description: `${reshareComment}\n\nReshared from ${reshareTargetPost.userId}: ${reshareTargetPost.description}`,
      likes: 0,
    };
    try {
      await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      alert("Post reshared!");
      setReshareModalOpen(false);
      fetchAllPosts();
    } catch (err) {
      console.error("Reshare failed", err);
    }
  };

  const openCommentPopup = (postId) => setOpenCommentPostId(postId);
  const closeCommentPopup = () => setOpenCommentPostId(null);

  const handleCommentAdded = (postId) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    setCommentRefresh((prev) => ({ ...prev, [postId]: prev[postId] + 1 }));
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box className="font-sans px-4 py-6 bg-white dark:bg-gray-900 min-h-screen transition-all">
      {posts.map((post, index) => (
        <Card
          key={post.postId}
          className={`rounded-2xl shadow-lg w-full border mb-10 transition-all ${
            index % 2 === 0
              ? "bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-800 dark:to-gray-900"
              : "bg-white dark:bg-gray-800"
          } border-gray-200 dark:border-gray-700`}
        >
          <Box className="flex items-center gap-4 px-6 pt-4 pb-2">
            <img
              src={profileImg}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-400"
            />
            <Box>
              <Typography className="text-md font-semibold text-gray-800 dark:text-white">
                {post.userId}
              </Typography>
              <Typography className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(post.date)}
              </Typography>
            </Box>
          </Box>

          {/* Media */}
          {post.videoUrl ? (
            <CardMedia
              component="video"
              src={post.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-h-[500px] object-contain"
            />
          ) : post.imageUrls?.length > 1 ? (
            <PostSlider images={post.imageUrls} />
          ) : post.imageUrls?.length === 1 ? (
            <CardMedia
              component="img"
              src={post.imageUrls[0]}
              alt="Post"
              className="w-full max-h-[500px] object-contain"
            />
          ) : (
            <CardMedia
              component="img"
              src="https://via.placeholder.com/800x300?text=No+Media"
              alt="No media"
              className="w-full object-contain"
            />
          )}

          {/* Content */}
          <CardContent className="px-6 pb-4">
            <Typography className="text-xl font-bold text-indigo-800 dark:text-indigo-300">
              {post.post}
            </Typography>
            <Typography className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
              {post.description}
            </Typography>

            <Box className="flex items-center gap-4 mt-4">
              <Button onClick={() => handleLike(post.postId)} className="text-indigo-600 dark:text-indigo-400 font-medium">
                ❤️ {post.likes}
              </Button>
              <Button onClick={() => openCommentPopup(post.postId)} className="text-blue-600 dark:text-blue-400 font-medium">
                💬 {commentCounts[post.postId] || 0}
              </Button>
              <Button onClick={() => handleReshareOpen(post)} className="text-purple-600 dark:text-purple-400 font-medium">
                🔁 Reshare
              </Button>
            </Box>

            <Box className="flex gap-2 flex-wrap mt-4">
              {post.tags?.map((tag, i) => (
                <Chip
                  key={i}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                  style={{
                    color: "#6366f1",
                    borderColor: "#6366f1",
                    fontWeight: "500",
                  }}
                />
              ))}
            </Box>
          </CardContent>

          {/* Comment Modal */}
          <Modal open={openCommentPostId === post.postId} onClose={closeCommentPopup}>
            <Box className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-xl mx-auto mt-24">
              <Typography variant="h6" className="mb-2 text-purple-800 dark:text-purple-300">
                💬 Comment on "{post.post}"
              </Typography>
              <AddComment postId={post.postId} onCommentAdded={() => handleCommentAdded(post.postId)} />
              <div className="mt-4">
                <CommentList postId={post.postId} refreshTrigger={commentRefresh[post.postId]} />
              </div>
            </Box>
          </Modal>
        </Card>
      ))}

      {/* Reshare Modal */}
      <Modal open={reshareModalOpen} onClose={() => setReshareModalOpen(false)}>
        <Box className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 max-w-xl mx-auto mt-24">
          <Typography variant="h6" className="mb-3 text-purple-800 dark:text-purple-300">
            Add your comment for resharing
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Type something..."
            value={reshareComment}
            onChange={(e) => setReshareComment(e.target.value)}
            className="mb-4"
            InputProps={{
              className: "dark:text-white",
            }}
          />
          <Button
            onClick={handleReshareConfirm}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-2 rounded w-full hover:brightness-110"
          >
            Confirm Reshare
          </Button>
        </Box>
      </Modal>

      {/* Expanded Media Modal */}
      <Modal open={!!expandedMedia} onClose={() => setExpandedMedia(null)}>
        <Box className="w-full max-w-5xl mx-auto mt-16 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          {expandedMedia?.type === "video" && (
            <video src={expandedMedia.content} controls className="w-full" />
          )}
          {expandedMedia?.type === "image" && (
            <img src={expandedMedia.content} alt="Expanded" className="w-full" />
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
