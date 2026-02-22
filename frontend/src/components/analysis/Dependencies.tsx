import React from "react";

interface DependenciesProps {
  dependencies: string[];
}

const Dependencies: React.FC<DependenciesProps> = ({ dependencies }) => {
  return (
    <div className="analysis-section">
      <h3 className="font-bold text-lg">Dependencies:</h3>
      {dependencies.length === 0 ? (
        <p>No dependencies found.</p>
      ) : (
        <ul className="list-disc list-inside pl-4">
          {dependencies.map((dep) => (
            <li key={dep}>{dep}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dependencies;
