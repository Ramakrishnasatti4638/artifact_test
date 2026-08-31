import React from 'react';
import UrlCard from './UrlCard';
import './UrlList.css';

function UrlList({ urls, onUrlDeleted }) {
  return (
    <div className="url-list">
      {urls.map(url => (
        <UrlCard
          key={url.shortCode}
          url={url}
          onDelete={onUrlDeleted}
        />
      ))}
    </div>
  );
}

export default UrlList;
