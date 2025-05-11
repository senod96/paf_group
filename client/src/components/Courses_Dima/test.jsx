import React, { useState } from "react";
import AddQuiz from "./AddQuiz"; // Adjust path if needed

const QuizWrapper = () => {
  const [quizData, setQuizData] = useState({
    questions: [],
  });

  return (
    <div style={{ padding: 20 }}>
      <AddQuiz quizData={quizData} setQuizData={setQuizData} />
    </div>
  );
};

export default QuizWrapper;
