import { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';

const DebugFeaturedProjects = () => {
  const { featuredProjects, loading, error, fetchFeaturedProjects } = useData();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    console.log('DebugFeaturedProjects: Component mounted');
    
    // Update debug info whenever featuredProjects changes
    setDebugInfo({
      timestamp: new Date().toISOString(),
      featuredProjectsLength: featuredProjects?.length || 0,
      featuredProjects: featuredProjects,
      isLoading: loading?.featuredProjects || false,
      hasError: error?.featuredProjects || null,
    });
    
    console.log('DebugFeaturedProjects: State update', {
      featuredProjectsLength: featuredProjects?.length || 0,
      featuredProjects: featuredProjects,
      isLoading: loading?.featuredProjects || false,
      hasError: error?.featuredProjects || null,
    });
  }, [featuredProjects, loading, error]);

  const handleManualFetch = () => {
    console.log('DebugFeaturedProjects: Manual fetch triggered');
    fetchFeaturedProjects();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'white',
      border: '2px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h4>🐛 Featured Projects Debug</h4>
      <div><strong>Count:</strong> {debugInfo.featuredProjectsLength}</div>
      <div><strong>Loading:</strong> {String(debugInfo.isLoading)}</div>
      <div><strong>Error:</strong> {debugInfo.hasError || 'None'}</div>
      <div><strong>Last Update:</strong> {debugInfo.timestamp}</div>
      <button onClick={handleManualFetch} style={{ marginTop: '5px', fontSize: '10px' }}>
        Refetch Data
      </button>
      {debugInfo.featuredProjects && debugInfo.featuredProjects.length > 0 && (
        <div style={{ marginTop: '5px' }}>
          <strong>Projects:</strong>
          <ul style={{ fontSize: '10px', margin: '5px 0', paddingLeft: '15px' }}>
            {debugInfo.featuredProjects.map(project => (
              <li key={project.id}>{project.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DebugFeaturedProjects;