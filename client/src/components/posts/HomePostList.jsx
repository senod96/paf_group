import React, { useEffect, useState } from "react";
import AddComment from "./AddComment";
import CommentList from "./CommentList";
import PostSlider from "./PostSlider";
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
  const [userMap, setUserMap] = useState({});
  const [followersMap, setFollowersMap] = useState({});
  const [requestMap, setRequestMap] = useState({});
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

      // Fetch user names + profile pics
      const userIds = [...new Set(visiblePosts.map(p => p.userId))];
      const users = await Promise.all(
        userIds.map(id =>
          fetch(`http://localhost:8080/api/users/${id}`).then(res => res.json())
        )
      );

      const map = {};
      const followMap = {};
      users.forEach(user => {
        map[user.id] = {
          name: user.name,
          profilePicture: user.profilePicture || "https://via.placeholder.com/120",
        };
        followMap[user.id] = user.followers || [];
      });

      setUserMap(map);
      setFollowersMap(followMap);

      // Fetch follow requests
      const pendingRequests = {};
      for (let uid of userIds) {
        const reqRes = await fetch(`http://localhost:8080/api/follow-requests/pending/${uid}`);
        const reqData = await reqRes.json();
        pendingRequests[uid] = reqData.some(req => req.senderId === currentUserId);
      }
      setRequestMap(pendingRequests);

    } catch (err) {
      console.error("Error loading posts", err);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const handleFollow = async (targetId) => {
    try {
      const followRes = await fetch(`http://localhost:8080/api/follow-requests/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUserId, receiverId: targetId }),
      });

      if (followRes.ok) {
        await fetch(`http://localhost:8080/api/notifications/follow?senderId=${currentUserId}&receiverId=${targetId}`, {
          method: 'POST',
        });
        setRequestMap((prev) => ({ ...prev, [targetId]: true }));
      }
    } catch (err) {
      console.error("❌ Follow process failed:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/like?userId=${currentUserId}`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error(await res.text());
      const updatedPost = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.postId === postId ? { ...p, likes: updatedPost.likes, likedBy: updatedPost.likedBy } : p))
      );
    } catch (err) {
      console.error("Like/Unlike failed:", err);
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
      post: reshareTargetPost.post,
      description: `${reshareComment}\n\nReshared from ${userMap[reshareTargetPost.userId]?.name || reshareTargetPost.userId}: ${reshareTargetPost.description}`,
      tags: reshareTargetPost.tags,
      userId: currentUserId,
      date: new Date().toISOString(),
      imageUrls: reshareTargetPost.imageUrls,
      videoUrl: reshareTargetPost.videoUrl,
      likes: 0,
      likedBy: [],
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
      console.error("Error resharing post:", err);
    }
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
    <Box className="font-sans px-4 py-4 bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center">
      {posts.map((post) => {
        const hasLiked = post.likedBy?.includes(currentUserId);
        const userInfo = userMap[post.userId] || {};
        const userName = userInfo.name || post.userId;
        const profilePic = userInfo.profilePicture;
        const isFollowing = followersMap[post.userId]?.includes(currentUserId);
        const hasRequested = requestMap[post.userId];

        return (
          <Card
            key={post.postId}
            className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 overflow-hidden border"
          >
            <Box className="flex items-center justify-between p-4">
              <Box className="flex items-center gap-4">
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <Box>
                  <Typography className="text-lg font-semibold text-gray-800 dark:text-white">
                    {userName}
                  </Typography>
                  <Typography className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(post.date)}
                  </Typography>
                </Box>
              </Box>
              {isFollowing ? (
                <span className="text-green-600 text-sm font-medium">Following</span>
              ) : hasRequested ? (
                <span className="text-yellow-600 text-sm font-medium">Requested</span>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  className="text-blue-600 border-blue-600 text-sm"
                  onClick={() => handleFollow(post.userId)}
                >
                  Follow
                </Button>
              )}
            </Box>

            {/* Media */}
            {post.videoUrl ? (
              <CardMedia component="video" src={post.videoUrl} autoPlay loop muted playsInline className="w-full max-h-[400px] object-cover border-t border-b" />
            ) : post.imageUrls?.length > 1 ? (
              <PostSlider images={post.imageUrls} />
            ) : post.imageUrls?.length === 1 ? (
              <CardMedia component="img" src={post.imageUrls[0]} alt="Post" className="w-full max-h-[400px] object-cover border-t border-b" />
            ) : (
              <CardMedia component="img" src="https://via.placeholder.com/800x300?text=No+Media" alt="No media" className="w-full object-contain border-t border-b" />
            )}

            {/* Description */}
            <CardContent className="px-6 pb-2">
              <Typography className="text-[17px] text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line leading-relaxed">
                {post.description}
              </Typography>

              <Box className="flex gap-2 flex-wrap mt-4">
                {post.tags?.map((tag, idx) => (
                  <Chip key={idx} label={`#${tag}`} size="small" variant="outlined" style={{
                    color: "#3b82f6", borderColor: "#3b82f6",
                    fontWeight: "500", fontSize: "14px", padding: "4px", borderRadius: "9999px"
                  }} />
                ))}
              </Box>
            </CardContent>

            {/* Buttons */}
            <Box className="flex items-center justify-around text-base border-t p-3">
              <motion.button whileTap={{ scale: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => handleLike(post.postId)} className={`font-semibold ${hasLiked ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}>
                {hasLiked ? "👍 Liked" : "👍 Like"} {post.likes}
              </motion.button>

              <Button onClick={() => handleCommentToggle(post.postId)} className="text-gray-600 dark:text-gray-300 font-semibold">
                💬 Comments {commentCounts[post.postId] || 0}
              </Button>

              <Button onClick={() => handleReshareOpen(post)} className="text-gray-600 dark:text-gray-300 font-semibold">
                🔁 Reposts
              </Button>
            </Box>

            {/* Comments */}
            {openCommentPostId === post.postId && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="px-6 py-4 border-t">
                <Typography variant="h6" className="text-md mb-2 text-indigo-700">Comments</Typography>
                <AddComment postId={post.postId} onCommentAdded={() => handleCommentAdded(post.postId)} />
                <div className="mt-4">
                  <CommentList postId={post.postId} refreshTrigger={commentRefresh[post.postId]} />
                </div>
              </motion.div>
            )}
          </Card>
        );
      })}

      {/* Reshare Modal */}
      {reshareModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Reshare Post</h2>
            <textarea
              value={reshareComment}
              onChange={(e) => setReshareComment(e.target.value)}
              rows={3}
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
              placeholder="Add your thoughts..."
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setReshareModalOpen(false)} className="text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={handleReshareConfirm} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Reshare</button>
            </div>
          </div>
        </motion.div>
      )}
    </Box>
  );
};

export default HomePostList;
