import React from "react";

interface ConditionsProps {
  conditions: string[];
}

const Conditions: React.FC<ConditionsProps> = ({ conditions }) => {
  return (
    <div className="analysis-section">
      <h3 className="font-bold text-lg">Conditions:</h3>
      {conditions.length === 0 ? (
        <p>No conditions found.</p>
      ) : (
        <ul className="list-disc list-inside pl-4">
          {conditions.map((cond, idx) => (
            <li key={idx}>{cond}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Conditions;
