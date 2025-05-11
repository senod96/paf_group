import React, { useState } from "react";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";

const AddPost = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored?.startsWith("{") ? JSON.parse(stored) : { id: stored };
    } catch {
      return null;
    }
  });

  const userId = user?.id || "";
  const [post, setPost] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
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
        likes: 0, // Automatically set to 0
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
      setImageFiles([]);
      setVideoFile(null);
      setSuccess("✅ Post added successfully!");
    } catch (err) {
      console.error("Post creation failed:", err);
      setError("Failed to upload post.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-xl shadow-lg font-sans">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-700">📸 Share a New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-6 text-lg">
        <div>
          <label className="block text-blue-700 font-semibold mb-2">Post Title</label>
          <input
            type="text"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            required
            className="w-full border border-blue-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>

        <div>
          <label className="block text-blue-700 font-semibold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full border border-blue-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>

        <div>
          <label className="block text-blue-700 font-semibold mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., ui, engineering"
            className="w-full border border-blue-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>

        <div>
          <label className="block text-blue-700 font-semibold mb-2">Upload Images (up to 3)</label>
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
          <label className="block text-blue-700 font-semibold mb-2">Or Upload Video</label>
          <input
            type="file"
            accept="video/*"
            disabled={imageFiles.length > 0}
            onChange={handleVideoChange}
            className="w-full"
          />
        </div>

        {imageFiles.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {imageFiles.map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-28 h-28 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}

        {videoFile && (
          <div className="mt-4">
            <video
              src={URL.createObjectURL(videoFile)}
              controls
              className="w-full max-w-lg rounded-lg border"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-base font-medium">{error}</p>}
        {success && <p className="text-green-600 text-base font-medium">{success}</p>}

        <button
          type="submit"
          className="w-full py-3 rounded-lg text-white font-bold text-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 hover:brightness-110 transition"
        >
          🚀 Share Post
        </button>
      </form>
    </div>
  );
};

export default AddPost;
