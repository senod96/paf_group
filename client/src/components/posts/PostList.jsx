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
  Button,
  Modal,
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
    } catch (err) {
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

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/like`, { method: "PUT" });
      const updated = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.postId === postId ? { ...p, likes: updated.likes } : p))
      );
    } catch (err) {
      console.error("Like error:", err);
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
    <Box className="max-w-4xl mx-auto p-4 font-sans">
      <Typography variant="h5" gutterBottom className="text-purple-800 font-bold text-2xl mb-4">
        My Posts
      </Typography>

      {posts.map((post, index) => (
        <Card
          key={post.postId}
          className={`rounded-md shadow-md border mb-10 pb-4 ${
            index % 2 === 0 ? "bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100" : "bg-white"
          }`}
        >
          {editingPostId === post.postId ? (
            <UpdatePost postId={post.postId} onUpdateSuccess={handleEditSuccess} />
          ) : (
            <>
              {post.videoUrl ? (
                <CardMedia
                  component="video"
                  src={post.videoUrl}
                  autoPlay
                  loop
                  muted
                  className="w-full max-h-[500px] object-contain"
                />
              ) : post.imageUrls?.length > 1 ? (
                <PostSlider images={post.imageUrls} />
              ) : post.imageUrls?.length === 1 ? (
                <CardMedia
                  component="img"
                  src={post.imageUrls[0]}
                  alt="Post media"
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

              <CardContent className="px-6 py-4">
                {post.resharedComment && (
                  <Typography className="italic text-sm text-gray-500 mb-1">
                    {post.resharedComment}
                  </Typography>
                )}
                {post.originalUserId && (
                  <Typography className="text-xs text-gray-400 mb-1">
                    🔁 Reshared from: {post.originalUserId}
                  </Typography>
                )}

                <Typography variant="h6" className="text-purple-800 font-bold text-lg">
                  {post.post}
                </Typography>
                <Typography className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                  {post.description}
                </Typography>

                <Box className="flex items-center gap-4 mt-4">
                  <Button onClick={() => handleLike(post.postId)} className="text-pink-600 font-semibold">
                    ❤️ {post.likes}
                  </Button>
                  <Button
                    onClick={() => setOpenCommentPostId(post.postId)}
                    className="text-blue-600 font-semibold"
                  >
                    💬 {commentCounts[post.postId] || 0}
                  </Button>
                </Box>

                <Box className="mt-4 flex gap-2 flex-wrap">
                  {post.tags?.map((tag, i) => (
                    <Chip
                      key={i}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      style={{ color: "#9333ea", borderColor: "#9333ea" }}
                    />
                  ))}
                </Box>

                <Typography className="text-xs text-gray-500 mt-3">{post.date}</Typography>

                <CommentList
                  postId={post.postId}
                  refreshTrigger={commentRefresh[post.postId] || 0}
                />

                <Box className="mt-4 flex gap-3">
                  <Button
                    variant="outlined"
                    className="text-purple-700 border-purple-700"
                    onClick={() => setEditingPostId(post.postId)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    className="text-red-600 border-red-600"
                    onClick={() => handleDelete(post.postId)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </>
          )}

          <Modal
            open={openCommentPostId === post.postId}
            onClose={() => setOpenCommentPostId(null)}
          >
            <Box className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl mx-auto mt-24">
              <Typography variant="h6" className="mb-2 text-purple-800">
                💬 Add Comment
              </Typography>
              <AddComment
                postId={post.postId}
                onCommentAdded={() => handleCommentAdded(post.postId)}
              />
            </Box>
          </Modal>
        </Card>
      ))}
    </Box>
  );
};

export default PostList;
