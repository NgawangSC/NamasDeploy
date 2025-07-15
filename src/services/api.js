import React, { useState, useEffect } from 'react';
import { useBlogs } from '../hooks/useApi';

const AdminBlogs = () => {
  const { data: blogs, loading, error, refetch } = useBlogs();
  const [selectedBlog, setSelectedBlog] = useState(null);

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    // Add your edit logic here
  };

  const handleDelete = (blogId) => {
    // Add your delete logic here
    if (window.confirm('Are you sure you want to delete this blog?')) {
      // Call delete API
      console.log('Deleting blog:', blogId);
    }
  };

  const handleCreate = () => {
    // Add your create logic here
    console.log('Creating new blog');
  };

  if (loading) return <div>Loading blogs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-blogs">
      <div className="admin-header">
        <h1>Admin - Blogs</h1>
        <button onClick={handleCreate} className="btn-primary">
          Create New Blog
        </button>
      </div>

      <div className="blogs-list">
        {blogs && blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog.id} className="blog-item">
              <div className="blog-info">
                <h3>{blog.title}</h3>
                <p>{blog.excerpt || 'No excerpt available'}</p>
                <span className="blog-date">
                  {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'No date'}
                </span>
              </div>
              <div className="blog-actions">
                <button 
                  onClick={() => handleEdit(blog)} 
                  className="btn-secondary"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(blog.id)} 
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-blogs">
            <p>No blogs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;