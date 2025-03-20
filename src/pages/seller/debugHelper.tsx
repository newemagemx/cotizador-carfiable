
import React from 'react';

// This component is a temporary debug helper to find router nesting issues
const DebugHelper: React.FC = () => {
  return (
    <div className="p-8 bg-red-100 rounded-lg m-4">
      <h2 className="text-xl font-bold text-red-800 mb-4">Debug Helper</h2>
      <p>This component is loaded to help debug router nesting issues.</p>
      <p>If you're seeing this, the router issue should be resolved.</p>
    </div>
  );
};

export default DebugHelper;
