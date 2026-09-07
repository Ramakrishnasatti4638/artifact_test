import React from 'react';
import './URLList.css';
import URLItem from './URLItem';

function URLList({ urls }) {
  return (
    <div className="url-list">
      {urls.map((item) => (
        <URLItem key={item.shortCode} item={item} />
      ))}
    </div>
  );
}

export default URLList;
