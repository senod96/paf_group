import React, { useEffect, useState } from "react";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";

const AddPost = () => {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/100");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const parsed = stored?.startsWith("{") ? JSON.parse(stored) : { id: stored };
      setUser(parsed);

      // Fetch user details to get profile picture
      fetch(`http://localhost:8080/api/users/${parsed.id}`)
        .then(res => res.json())
        .then(data => {
          setProfilePic(data.profilePicture || "https://via.placeholder.com/100");
        })
        .catch(err => console.error("Failed to fetch profile picture", err));
    } catch {
      setUser(null);
    }
  }, []);

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

      try {
        await fetch(
          `http://localhost:8080/api/notifications/post-share?senderId=${userId}&postTitle=${encodeURIComponent(post)}`,
          { method: "POST" }
        );
      } catch (notificationError) {
        console.error("Failed to send notifications:", notificationError);
      }

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
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Top: Start a Post */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={profilePic}
          alt="Profile"
          className="w-11 h-11 rounded-full object-cover"
        />
        <input
          type="text"
          value={post}
          onChange={(e) => setPost(e.target.value)}
          placeholder="Start a post"
          required
          className="flex-grow bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-full text-sm focus:outline-none"
        />
      </div>

      <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>

      {/* Media Upload Buttons */}
      <div className="flex justify-around text-sm text-gray-600 dark:text-gray-300 font-medium">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="file"
            accept="video/*"
            disabled={imageFiles.length > 0}
            onChange={handleVideoChange}
            hidden
          />
          <span className="flex items-center gap-1">
            <span className="text-green-600">▶️</span> Video
          </span>
        </label>

        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!!videoFile}
            onChange={handleImageChange}
            hidden
          />
          <span className="flex items-center gap-1">
            <span className="text-blue-600">🖼️</span> Photo
          </span>
        </label>
      </div>

      {/* Expanded Post Form */}
      {post.trim() !== "" && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-sm">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your post description..."
            required
            rows="4"
            className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-3 rounded-md"
          />

          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white p-3 rounded-md"
          />

          {imageFiles.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {imageFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-md border"
                />
              ))}
            </div>
          )}

          {videoFile && (
            <div>
              <video
                src={URL.createObjectURL(videoFile)}
                controls
                className="w-full max-w-md rounded-md border"
              />
            </div>
          )}

          {error && <p className="text-red-500 font-medium">{error}</p>}
          {success && <p className="text-green-500 font-medium">{success}</p>}

          <button
            type="submit"
            className="w-full py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
};

export default AddPost;
