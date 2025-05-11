import React, { useEffect, useState } from "react";
import AddComment from "./AddComment";
import CommentList from "./CommentList";
import PostSlider from "./PostSlider";
import UpdatePost from "./UpdatePost";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
} from "@mui/material";

const PostList = () => {
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
  const [editingPostId, setEditingPostId] = useState(null);

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
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const handleLikeToggle = async (postId) => {
    const storedUser = localStorage.getItem("user");
    const userId = storedUser?.startsWith("{") ? JSON.parse(storedUser).id : storedUser;

    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/like?userId=${userId}`, {
        method: "PUT",
      });
      const updatedPost = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.postId === postId ? { ...p, likes: updatedPost.likes, likedBy: updatedPost.likedBy } : p))
      );
    } catch (err) {
      console.error("Like toggle error:", err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetch(`http://localhost:8080/api/posts/${postId}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.postId !== postId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCommentAdded = (postId) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    setCommentRefresh((prev) => ({ ...prev, [postId]: prev[postId] + 1 }));
  };

  const handleEditSuccess = () => {
    setEditingPostId(null);
    fetchAllPosts();
  };

  return (
    <Box className="font-sans px-4 py-8 bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center text-gray-800 dark:text-white">
      <Typography variant="h5" className="text-2xl font-bold mb-6">
        My Posts
      </Typography>

      {posts.map((post) => {
        const hasLiked = post.likedBy?.includes(currentUserId);

        return (
          <motion.div
            key={post.postId}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-10 overflow-hidden border border-gray-300 dark:border-gray-700">
              {editingPostId === post.postId ? (
                <UpdatePost postId={post.postId} onUpdateSuccess={handleEditSuccess} />
              ) : (
                <>
                  {/* Media */}
                  {post.videoUrl ? (
                    <CardMedia
                      component="video"
                      src={post.videoUrl}
                      autoPlay
                      loop
                      muted
                      className="w-full max-h-[400px] object-cover"
                    />
                  ) : post.imageUrls?.length > 1 ? (
                    <PostSlider images={post.imageUrls} />
                  ) : post.imageUrls?.length === 1 ? (
                    <CardMedia
                      component="img"
                      src={post.imageUrls[0]}
                      alt="Post media"
                      className="w-full max-h-[400px] object-cover"
                    />
                  ) : (
                    <CardMedia
                      component="img"
                      src="https://via.placeholder.com/800x300?text=No+Media"
                      alt="No media"
                      className="w-full object-cover"
                    />
                  )}

                  <CardContent className="px-6 py-4">
                    <Typography variant="h6" className="text-xl font-semibold">
                      {post.post}
                    </Typography>

                    <Typography className="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-line leading-relaxed">
                      {post.description}
                    </Typography>

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
                          }}
                        />
                      ))}
                    </Box>

                    <Box className="flex items-center gap-6 mt-6">
                      <Button
                        onClick={() => handleLikeToggle(post.postId)}
                        className={`font-semibold ${hasLiked ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}
                      >
                        {hasLiked ? "👍 Liked" : "👍 Like"} {post.likes}
                      </Button>
                      <Button
                        onClick={() => setOpenCommentPostId(post.postId)}
                        className="text-gray-600 dark:text-gray-300 font-semibold"
                      >
                        💬 {commentCounts[post.postId] || 0}
                      </Button>
                    </Box>

                    <Typography className="text-xs text-gray-400 dark:text-gray-500 mt-4">{post.date}</Typography>

                    {openCommentPostId === post.postId && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                        <AddComment postId={post.postId} onCommentAdded={() => handleCommentAdded(post.postId)} />
                        <CommentList postId={post.postId} refreshTrigger={commentRefresh[post.postId]} />
                      </motion.div>
                    )}

                    <Box className="flex gap-4 mt-6">
                      <Button
                        variant="outlined"
                        onClick={() => setEditingPostId(post.postId)}
                        className="text-blue-600 border-blue-600"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleDelete(post.postId)}
                        className="text-red-500 border-red-500"
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        );
      })}
    </Box>
  );
};

export default PostList;
