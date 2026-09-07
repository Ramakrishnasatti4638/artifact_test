import React, { useState } from 'react';
import URLCard from './URLCard';
import './URLList.css';

function URLList({ urls, onDelete }) {
  const [sortBy, setSortBy] = useState('newest');

  const sortedUrls = [...urls].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'most-clicks':
        return b.clicks - a.clicks;
      default:
        return 0;
    }
  });

  return (
    <div className="url-list">
      <div className="sort-controls">
        <label htmlFor="sort">Sort by:</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most-clicks">Most Clicks</option>
        </select>
      </div>

      <div className="url-cards">
        {sortedUrls.map((urlData) => (
          <URLCard
            key={urlData.shortCode}
            url={urlData}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default URLList;
