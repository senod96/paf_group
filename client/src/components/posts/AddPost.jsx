import React, { useState } from "react";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";

const AddPost = () => {
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

  const userId = user?.id || "";

  const [post, setPost] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [likes, setLikes] = useState(0);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError("You can only upload up to 3 images.");
      return;
    }
    setImageFiles(files);
    setVideoFile(null);
    setError("");
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setImageFiles([]);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!userId || !post.trim() || !description.trim()) {
      setError("Post Title, Description and User ID are required.");
      return;
    }

    if (imageFiles.length > 0 && videoFile) {
      setError("You can only upload images OR a video, not both.");
      return;
    }

    try {
      let imageUrls = [];
      let videoUrl = null;

      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(
          imageFiles.map((file) => uploadImageToFirebase(file))
        );
      } else if (videoFile) {
        videoUrl = await uploadImageToFirebase(videoFile);
      }

      const newPost = {
        userId,
        post,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        likes: parseInt(likes),
        imageUrls,
        videoUrl,
        date: new Date().toISOString(),
      };

      const res = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!res.ok) throw new Error("Post creation failed");

      setPost("");
      setDescription("");
      setTags("");
      setLikes(0);
      setImageFiles([]);
      setVideoFile(null);
      setSuccess("✅ Post added successfully!");
    } catch (err) {
      console.error("Post creation failed:", err);
      setError("Failed to upload post.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow font-sans">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Create a New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Post Title:</label>
          <input
            type="text"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Tags (comma separated):</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., engineering, ui, backend"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Likes (optional):</label>
          <input
            type="number"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            min="0"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Upload Images (max 3):</label>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!!videoFile}
            onChange={handleImageChange}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Or Upload Video:</label>
          <input
            type="file"
            accept="video/*"
            disabled={imageFiles.length > 0}
            onChange={handleVideoChange}
            className="w-full"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        {imageFiles.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {imageFiles.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt={`preview-${i}`}
                className="w-24 h-24 object-cover border rounded"
              />
            ))}
          </div>
        )}

        {videoFile && (
          <div className="mt-2">
            <video
              src={URL.createObjectURL(videoFile)}
              controls
              className="w-full max-w-md border rounded"
            />
          </div>
        )}

        <button
          type="submit"
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Post
        </button>
      </form>
    </div>
  );
};

export default AddPost;
