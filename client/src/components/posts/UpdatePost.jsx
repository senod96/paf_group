import React, { useEffect, useState } from "react";

const UpdatePost = ({ postId, onUpdateSuccess }) => {
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

  const [post, setPost] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [likes, setLikes] = useState(0); // just for keeping it in state, not editable
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/posts/${postId}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();

        setPost(data.post || "");
        setDescription(data.description || "");
        setTags(data.tags?.join(", ") || "");
        setLikes(data.likes || 0); // not editable
        setImageUrls(data.imageUrls || []);
        if (data.imageUrls?.[0]) {
          setImagePreview(data.imageUrls[0]);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedPost = {
      userId: currentUserId, // retain original user
      post,
      description,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      likes, // keep same likes
      imageUrls, // retain original images
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (!res.ok) throw new Error("Update failed");
      alert("Post updated successfully!");
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  if (loading) return <p className="text-center py-6 text-gray-500">Loading post...</p>;

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-lg font-semibold mb-4">Update Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Post Title:</label>
          <input
            type="text"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Tags (comma separated):</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {imagePreview && (
          <div className="mt-3">
            <label className="block text-sm text-gray-600 mb-1">Current Image:</label>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-40 h-40 object-cover border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Image editing is disabled.</p>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Update Post
        </button>
      </form>
    </div>
  );
};

export default UpdatePost;
