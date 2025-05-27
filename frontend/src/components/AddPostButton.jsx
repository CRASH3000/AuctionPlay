import React from "react";
import "./AddPostButton.css";

const AddPostButton = ({ onClick }) => {
  return (
    <button className="add-post-button" onClick={onClick}>
      <div className="add-post-icon">＋</div>
    </button>
  );
};

export default AddPostButton;
