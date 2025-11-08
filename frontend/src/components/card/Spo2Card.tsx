import React from "react";

interface Spo2CardProps {
  spo2: number;
}

const Spo2Card: React.FC<Spo2CardProps> = ({ spo2 }) => {
  const getStatus = () => {
    if (spo2 >= 95) return "normal";
    if (spo2 >= 90) return "attention";
    return "critique";
  };

  const status = getStatus();

  const getStatusColor = () => {
    switch (status) {
      case "normal":
        return "bg-green-500";
      case "attention":
        return "bg-yellow-500";
      case "critique":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl shadow-lg text-white ${getStatusColor()} transition-all duration-300`}
    >
      <h3 className="text-xl font-bold">SpO₂</h3>
      <p className="text-3xl mt-2">{spo2}%</p>
      <p className="text-sm mt-1">
        {status === "normal" && "Saturation normale ✅"}
        {status === "attention" && "Saturation limite ⚠️"}
        {status === "critique" && "Saturation critique 🚨"}
      </p>
    </div>
  );
};

export default Spo2Card;
