import React, { useState, useCallback } from "react";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";
import { PlusCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import AddQuiz from "./AddQuiz"; // Your original AddQuiz component

const AddCourse = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored?.startsWith("{") ? JSON.parse(stored) : { id: stored };
    } catch {
      return null;
    }
  });

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [requirements, setRequirements] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [quiz, setQuiz] = useState({ title: "", questions: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleNext = useCallback(() => {
    if (step === 1 && (!title.trim() || !description.trim())) {
      setError("Title and Description are required.");
      return;
    }
    if (step === 2 && !imageFile) {
      setError("Course image is required.");
      return;
    }
    setError("");
    setStep(prev => prev + 1);
  }, [step, title, description, imageFile]);

  const handleBack = useCallback(() => {
    setError("");
    setStep(prev => prev - 1);
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setError("");
    } else {
      setError("Please upload an image file");
    }
  }, []);

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setError("");
    } else {
      setError("Please upload a video file");
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
  }, []);

  const handleRemoveVideo = useCallback(() => {
    setVideoFile(null);
  }, []);

  const handleQuizUpdate = useCallback((quizData) => {
    setQuiz(quizData);
  }, []);

  const handleImageUpload = async () => {
    setLoading(true);
    try {
      const imageUrl = await uploadImageToFirebase(imageFile);
      setLoading(false);
      return imageUrl;
    } catch (err) {
      console.error("Image upload failed", err);
      setError("Image upload failed");
      setLoading(false);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const imageUrl = await handleImageUpload();
      if (!imageUrl) return;

      const newCourse = {
        title,
        description,
        instructorId: user?.id || "",
        category,
        duration,
        level,
        requirements: requirements.split("\n").filter(Boolean),
        whatYouWillLearn: whatYouWillLearn.split("\n").filter(Boolean),
        createdAt: new Date().toISOString(),
        quiz: quiz.questions.length > 0 ? quiz : null,
        imageUrl,
        videoUrl: videoFile ? URL.createObjectURL(videoFile) : null,
      };

      await axios.post("http://localhost:8080/api/courses", newCourse);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setDuration("");
      setLevel("Beginner");
      setRequirements("");
      setWhatYouWillLearn("");
      setImageFile(null);
      setVideoFile(null);
      setQuiz({ title: "", questions: [] });
      setStep(1);
      setUploadProgress(0);

      setSuccess("Course created successfully!");
    } catch (err) {
      console.error("Course creation failed:", err);
      setError(err.message || "Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 text-gray-800 dark:text-gray-100 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 mb-2">
            Create New Course
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} transition-colors`}>
              1
            </div>
            <div className={`w-16 md:w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} transition-colors`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} transition-colors`}>
              2
            </div>
            <div className={`w-16 md:w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} transition-colors`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} transition-colors`}>
              3
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-200">
            {success}
          </div>
        )}

        {loading && (
          <div className="mb-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {step === 1 && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="e.g. Advanced React Development"
                />
              </div>

              <div>
                <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="Describe what students will learn in this course"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="e.g. Web Development"
                  />
                </div>

                <div>
                  <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                    Duration
                  </label>
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="e.g. 4 weeks"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                  Skill Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                  Requirements (one per line)
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={3}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="Basic programming knowledge\nComputer with internet access"
                />
              </div>

              <div>
                <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                  What You'll Learn (one per line)
                </label>
                <textarea
                  value={whatYouWillLearn}
                  onChange={(e) => setWhatYouWillLearn(e.target.value)}
                  rows={3}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="Build modern web applications\nUse React with TypeScript"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!title || !description || loading}
              className={`w-full py-4 mt-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 ${(!title || !description) ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Continue to Media"
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Course Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Course Title</h3>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{title || "Not set"}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Level</h3>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">{level}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                  <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Status</h3>
                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">Draft</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Course Image <span className="text-red-500">*</span>
                </h3>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                        {imageFile ? imageFile.name : 'Upload course image'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      onChange={handleImageChange} 
                      className="opacity-0" 
                      accept="image/*"
                    />
                  </label>
                </div>
                {imageFile && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{imageFile.name}</span>
                      <button 
                        onClick={handleRemoveImage}
                        className="p-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <img 
                      src={URL.createObjectURL(imageFile)} 
                      alt="Preview" 
                      className="w-full h-auto rounded-lg max-h-48 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Introduction Video
                </h3>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                        {videoFile ? videoFile.name : 'Upload introduction video'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      onChange={handleVideoChange} 
                      className="opacity-0" 
                      accept="video/*"
                    />
                  </label>
                </div>
                {videoFile && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{videoFile.name}</span>
                      <button 
                        onClick={handleRemoveVideo}
                        className="p-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <video 
                      src={URL.createObjectURL(videoFile)} 
                      controls 
                      className="w-full rounded-lg max-h-48"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl shadow-md font-semibold transition-all"
              >
                <ChevronLeft size={20} /> Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={!imageFile || loading}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl shadow-lg font-semibold transition-all ${!imageFile ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                Continue to Quiz <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Add Quiz (Optional)
            </h2>
            
            {/* Using your original AddQuiz component */}
            <AddQuiz
              quizData={quiz}
              setQuizData={handleQuizUpdate}
            />

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl shadow-md font-semibold transition-all"
              >
                <ChevronLeft size={20} /> Back
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-8 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-xl shadow-lg font-bold text-lg transition-all hover:shadow-xl ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? 'Creating Course...' : 'Create Course'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCourse;


/*import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  IconButton
} from "@mui/material";
import {
  CloudUpload,
  Image as ImageIcon,
  VideoCameraBack,
  Delete
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AddQuiz from "./AddQuiz";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const steps = ['Course Details', 'Add Content', 'Add Quiz', 'Review & Submit'];

const AddCourse = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored?.startsWith("{") ? JSON.parse(stored) : { id: stored };
    } catch {
      return null;
    }
  });

  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [requirements, setRequirements] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [quiz, setQuiz] = useState({ title: "", questions: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const storage = getStorage();

  const handleBack = useCallback(() => {
    setError("");
    setActiveStep(prev => prev - 1);
  }, []);

  const handleNext = useCallback(() => {
    if (activeStep === 0 && (!title.trim() || !description.trim())) {
      setError("Title and Description are required.");
      return;
    }
    if (activeStep === 1 && !imageFile) {
      setError("Course image is required.");
      return;
    }
    setError("");
    setActiveStep(prev => prev + 1);
  }, [activeStep, title, description, imageFile]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setError("");
    } else {
      setError("Please upload an image file");
    }
  }, []);

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setError("");
    } else {
      setError("Please upload a video file");
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
  }, []);

  const handleRemoveVideo = useCallback(() => {
    setVideoFile(null);
  }, []);

  const handleQuizUpdate = useCallback((quizData) => {
    setQuiz(quizData);
  }, []);

  const handleImageSubmit = async () => {
    if (!imageFile) return null;
    try {
      const imageUrl = await uploadImageToFirebase(
        imageFile,
        `courses/images/${Date.now()}_${imageFile.name}`,
        (progress) => setUploadProgress(progress)
      );
      setSuccess("Image uploaded successfully!");
      return imageUrl;
    } catch (error) {
      setError("Failed to upload image");
      return null;
    }
  };

  const handleVideoSubmit = async () => {
    if (!videoFile) return null;
    
    try {
      const videoRef = ref(storage, `courses/videos/${Date.now()}_${videoFile.name}`);
      
      const uploadTask = uploadBytesResumable(videoRef, videoFile);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setError("Video upload failed. Please try again.");
          throw error;
        }
      );
      
      await uploadTask;
      
      const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
      setSuccess("Video uploaded successfully!");
      return videoUrl;
    } catch (error) {
      console.error("Video upload failed:", error);
      setError("Failed to upload video. Please check the file and try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsSubmitting(true);

    try {
      const [imageUrl, videoUrl] = await Promise.all([
        handleImageSubmit(),
        handleVideoSubmit()
      ]);

      const newCourse = {
        title,
        description,
        instructorId: user?.id || "",
        category,
        duration,
        level,
        requirements: requirements.split("\n").filter(Boolean),
        whatYouWillLearn: whatYouWillLearn.split("\n").filter(Boolean),
        createdAt: new Date().toISOString(),
        quiz: quiz.questions.length > 0 ? quiz : null,
        imageUrl,
        videoUrl,
      };

      const res = await fetch("http://localhost:8080/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (!res.ok) throw new Error(await res.text());

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setDuration("");
      setLevel("Beginner");
      setRequirements("");
      setWhatYouWillLearn("");
      setImageFile(null);
      setVideoFile(null);
      setQuiz({ title: "", questions: [] });
      setActiveStep(0);
      setUploadProgress(0);

      setSuccess("Course created successfully!");
    } catch (err) {
      console.error("Course creation failed:", err);
      setError(err.message || "Failed to create course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = useCallback((step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (e.g., 4 weeks)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Level</InputLabel>
                <Select
                  value={level}
                  label="Level"
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements (one per line)"
                multiline
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Basic programming knowledge\nComputer with internet access"
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="What You'll Learn (one per line)"
                multiline
                rows={3}
                value={whatYouWillLearn}
                onChange={(e) => setWhatYouWillLearn(e.target.value)}
                placeholder="Build modern web applications\nUse React with TypeScript"
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon color="primary" /> Course Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload a high-quality image that represents your course (required)
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mt: 1 }}
                  >
                    Upload Image
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {imageFile && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label={imageFile.name} sx={{ maxWidth: '70%' }} />
                        <IconButton onClick={handleRemoveImage} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                      <CardMedia
                        component="img"
                        image={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        sx={{ maxHeight: 200, borderRadius: 1, mt: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideoCameraBack color="primary" /> Course Video
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload an introduction video for your course (optional)
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mt: 1 }}
                  >
                    Upload Video
                    <VisuallyHiddenInput
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                    />
                  </Button>
                  {videoFile && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label={videoFile.name} sx={{ maxWidth: '70%' }} />
                        <IconButton onClick={handleRemoveVideo} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                      <video
                        src={URL.createObjectURL(videoFile)}
                        controls
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 4, mt: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Quiz to Your Course
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a quiz to test your students' understanding (optional)
            </Typography>
            <AddQuiz
              quizData={quiz}
              setQuizData={handleQuizUpdate}
            />
          </Box>
        );
      default:
        return <Typography>Processing step</Typography>;
    }
  }, [title, description, category, duration, level, requirements,
    whatYouWillLearn, imageFile, videoFile, quiz,
    handleImageChange, handleVideoChange, handleRemoveImage, handleRemoveVideo, handleQuizUpdate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
          Create New Course
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {isSubmitting && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
            </Typography>
            <LinearProgress
              variant={uploadProgress > 0 ? "determinate" : "indeterminate"}
              value={uploadProgress}
            />
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? 'Creating...' : 'Create Course'}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default React.memo(AddCourse);*/