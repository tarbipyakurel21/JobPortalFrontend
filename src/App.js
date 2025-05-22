import React, { useState, useEffect } from 'react';
import './App.css'; // Make sure this CSS file exists!

const API_BASE_URL = 'http://localhost:8080'; // Your Spring Boot backend URL

function App() {
  const [posts, setPosts] = useState([]);
  const [newPostDesc, setNewPostDesc] = useState('');
  const [newPostExp, setNewPostExp] = useState(0);
  const [newPostProfile, setNewPostProfile] = useState('');
  const [newPostTechs, setNewPostTechs] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetches all job posts from the backend
  const fetchAllPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/allPosts`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Oops! Couldn't load job posts. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  // Handles adding a new job post via the form
  const handleAddPost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const techsArray = newPostTechs.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
      const postData = {
        desc: newPostDesc,
        exp: parseInt(newPostExp, 10),
        profile: newPostProfile,
        techs: techsArray,
      };

      const response = await fetch(`${API_BASE_URL}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const addedPost = await response.json();
      setPosts([...posts, addedPost]);
      setNewPostDesc('');
      setNewPostExp(0);
      setNewPostProfile('');
      setNewPostTechs('');
    } catch (err) {
      console.error("Failed to add post:", err);
      setError("Failed to add job post. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handles searching for job posts based on user input
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) {
      fetchAllPosts();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${searchText}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to search posts:", err);
      setError("Search failed. Ensure the backend is working or try a different keyword.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Job Portal</h1>
        <p>Find your next opportunity or post a new one!</p>
      </header>

      <main className="app-main-content">
        {/* Section for Adding New Job Posts */}
        <section className="card form-section">
          <h2>Post a New Job</h2>
          <form onSubmit={handleAddPost}>
            <div className="form-group">
              <label htmlFor="postProfile">Job Profile / Title:</label>
              <input
                id="postProfile"
                type="text"
                value={newPostProfile}
                onChange={(e) => setNewPostProfile(e.target.value)}
                placeholder="e.g., Software Engineer, Data Scientist"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="postDesc">Description:</label>
              <textarea
                id="postDesc"
                value={newPostDesc}
                onChange={(e) => setNewPostDesc(e.target.value)}
                placeholder="Briefly describe the role..."
                rows="3"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="postExp">Experience (Years):</label>
              <input
                id="postExp"
                type="number"
                value={newPostExp}
                onChange={(e) => setNewPostExp(e.target.value)}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="postTechs">Technologies (comma-separated):</label>
              <input
                id="postTechs"
                type="text"
                value={newPostTechs}
                onChange={(e) => setNewPostTechs(e.target.value)}
                placeholder="e.g., Java, Spring Boot, React, SQL"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Adding...' : 'Add Job Post'}
            </button>
          </form>
        </section>

        <hr className="divider" />

        {/* Section for Searching Job Posts */}
        <section className="card search-section">
          <h2>Find Jobs</h2>
          <form onSubmit={handleSearch}>
            <div className="form-group search-input-group">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by keyword (e.g., 'Java', 'developer')"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button type="button" onClick={fetchAllPosts} disabled={loading} className="btn btn-secondary">
              Show All
            </button>
          </form>
        </section>

        <hr className="divider" />

        {/* Section for Displaying All Job Posts */}
        <section className="posts-display-section">
          <h2>Available Job Openings</h2>
          {loading && <p className="status-message">Loading job posts...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && posts.length === 0 && !error && (
            <p className="status-message">No job posts found. Be the first to add one!</p>
          )}
          <div className="posts-grid">
            {posts.map((post) => (
              // Each job post is now a distinct 'post-card'
              <div key={post.id || Math.random()} className="post-card">
                <h3>{post.profile || 'Job Opportunity'}</h3>
                <p className="post-description">{post.desc || 'No description provided.'}</p>
                <p><strong>Experience:</strong> {post.exp} years</p>
                <p className="post-technologies">
                  <strong>Technologies:</strong>{" "}
                  {post.techs && post.techs.length > 0 ? post.techs.join(', ') : 'Not specified'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;