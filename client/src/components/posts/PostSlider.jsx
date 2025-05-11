import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const PostSlider = ({ images }) => {
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
    },
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxHeight: "600px",
        overflow: "hidden",
      }}
    >
      <div
        ref={sliderRef}
        className="keen-slider"
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="keen-slider__slide"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <img
              src={img}
              alt={`slide-${i}`}
              style={{
                width: "100%",
                maxHeight: "600px",
                objectFit: "contain",
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {instanceRef.current && (
        <>
          <button
            onClick={() => instanceRef.current.prev()}
            style={{
              position: "absolute",
              top: "50%",
              left: "10px",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            ‹
          </button>
          <button
            onClick={() => instanceRef.current.next()}
            style={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

export default PostSlider;
