import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PostGallery = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const sliderSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div style={styles.container}>
      {posts.map((post) => (
        <div key={post.postId} style={styles.card}>
          <h3>{post.post}</h3>
          <p><strong>Likes:</strong> {post.likes}</p>
          <p><strong>User:</strong> {post.userId}</p>

          {/* If video */}
          {post.videoBase64 ? (
            <video controls src={post.videoBase64} style={styles.video} />
          ) : post.imageBase64List?.length > 1 ? (
            // Slider for multiple images
            <Slider {...sliderSettings}>
              {post.imageBase64List.map((img, idx) => (
                <div key={idx}>
                  <img src={img} alt={`post-${idx}`} style={styles.sliderImage} />
                </div>
              ))}
            </Slider>
          ) : (
            // Single image
            post.imageBase64List?.length === 1 && (
              <img src={post.imageBase64List[0]} alt="post-img" style={styles.image} />
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default PostGallery;

// Styles
const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    flex: "1 1 45%",
    maxWidth: "45%",
    height: "450px",
    overflowY: "auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  image: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  sliderImage: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  video: {
    width: "100%",
    height: "250px",
    borderRadius: "6px",
  },
};
