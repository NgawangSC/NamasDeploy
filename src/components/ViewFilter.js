import React from 'react';
import { Search, Grid, List } from 'lucide-react';
import './ViewFilter.css';

const ViewFilter = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories, 
  viewMode, 
  onViewModeChange,
  totalItems,
  itemType = 'items'
}) => {
  return (
    <div className="view-filter">
      <div className="filter-header">
        <h3>Filter {itemType}</h3>
        <span className="item-count">{totalItems} {itemType.toLowerCase()}</span>
      </div>
      
      <div className="filter-controls">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={`Search ${itemType.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="view-mode-toggle">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List View"
          >
            <List size={20} />
          </button>
          <button
            className={`view-btn ${viewMode === 'detail' ? 'active' : ''}`}
            onClick={() => onViewModeChange('detail')}
            title="Detail View"
          >
            <Grid size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFilter;