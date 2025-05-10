import React, { useState } from "react";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";

const AddPost = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored?.startsWith("{")) return JSON.parse(stored);
      return { id: stored };
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
        likes: 0,
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
      setError("❌ Failed to upload post.");
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-100 p-6 flex justify-center items-start">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-200">📝 Create a New Post</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Post Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Post Title</label>
            <input
              type="text"
              value={post}
              onChange={(e) => setPost(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
              rows={4}
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., frontend, devops, ai"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Upload */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Upload Images (max 3)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={!!videoFile}
                onChange={handleImageChange}
                className="w-full text-sm"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Upload Video</label>
              <input
                type="file"
                accept="video/*"
                disabled={imageFiles.length > 0}
                onChange={handleVideoChange}
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Error and Success */}
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          {success && <p className="text-green-500 text-center text-sm">{success}</p>}

          {/* Preview */}
          {imageFiles.length > 0 && (
            <div className="flex gap-3 mt-2">
              {imageFiles.map((file, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-24 h-24 rounded object-cover border"
                />
              ))}
            </div>
          )}
          {videoFile && (
            <div className="mt-2">
              <video
                src={URL.createObjectURL(videoFile)}
                controls
                className="w-full rounded border"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-lg transition duration-300"
          >
            ➕ Add Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPost;
