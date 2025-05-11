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

  const handleCommentToggle = (postId) => {
    setOpenCommentPostId((prevId) => (prevId === postId ? null : postId));
  };

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
    <Box className="font-sans px-4 py-8 bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center">
      {posts.map((post) => (
        <Card
          key={post.postId}
          className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 overflow-hidden border"
        >
          {/* Profile Header */}
          <Box className="flex items-center justify-between p-4">
            <Box className="flex items-center gap-4">
              <img
                src={profileImg}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
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
            <Button size="small" variant="outlined" className="text-blue-600 border-blue-600">
              Follow
            </Button>
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
              className="w-full max-h-[400px] object-cover border-t border-b"
            />
          ) : post.imageUrls?.length > 1 ? (
            <PostSlider images={post.imageUrls} />
          ) : post.imageUrls?.length === 1 ? (
            <CardMedia
              component="img"
              src={post.imageUrls[0]}
              alt="Post"
              className="w-full max-h-[400px] object-cover border-t border-b"
            />
          ) : (
            <CardMedia
              component="img"
              src="https://via.placeholder.com/800x300?text=No+Media"
              alt="No media"
              className="w-full object-contain border-t border-b"
            />
          )}

          {/* Content */}
          <CardContent className="px-6 pb-2">
            <Typography className="text-gray-700 dark:text-gray-300 text-base mt-2 whitespace-pre-line">
              {post.description}
            </Typography>

            {/* Tags */}
            <Box className="flex gap-2 flex-wrap mt-4">
              {post.tags?.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                  style={{
                    color: "#3b82f6",
                    borderColor: "#3b82f6",
                    fontWeight: "500",
                    fontSize: "13px",
                    padding: "4px",
                    borderRadius: "9999px",
                  }}
                />
              ))}
            </Box>
          </CardContent>

          {/* Action Buttons */}
          <Box className="flex items-center justify-around text-sm border-t p-3">
            <Button onClick={() => handleLike(post.postId)} className="text-gray-600 dark:text-gray-300">
              👍 Like {post.likes}
            </Button>
            <Button onClick={() => handleCommentToggle(post.postId)} className="text-gray-600 dark:text-gray-300">
              💬 Comment {commentCounts[post.postId] || 0}
            </Button>
            <Button onClick={() => handleReshareOpen(post)} className="text-gray-600 dark:text-gray-300">
              🔁 Repost
            </Button>
          </Box>

          {/* Inline Comment Section */}
          {openCommentPostId === post.postId && (
            <Box className="px-6 py-4 border-t">
              <Typography variant="h6" className="text-md mb-2 text-indigo-700">
                Comments
              </Typography>
              <AddComment postId={post.postId} onCommentAdded={() => handleCommentAdded(post.postId)} />
              <div className="mt-4">
                <CommentList postId={post.postId} refreshTrigger={commentRefresh[post.postId]} />
              </div>
            </Box>
          )}
        </Card>
      ))}
    </Box>
  );
};

export default HomePostList;
