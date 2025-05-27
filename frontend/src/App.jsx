import { useState } from "react";
import Header from "./components/Header";
import AddPostButton from "./components/AddPostButton";
import PostModal from "./components/PostModal";
import AuthModal from "./components/AuthModal";
import "./App.css";

function App() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="App">
        <Header onProfileClick={() => setShowAuth(true)} />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        <AddPostButton onClick={() => setShowPostModal(true)} />
        {showPostModal && <PostModal onClose={() => setShowPostModal(false)} />}
    </div>
  );
}

export default App;
