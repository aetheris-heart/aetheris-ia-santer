import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export type TooltipProps = {
  label: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
};

const positionClasses: Record<string, string> = {
  top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
  left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
};

const Tooltip: React.FC<TooltipProps> = ({ label, children, position = "top" }) => {
  return (
    <div className="relative group inline-block">
      {children}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className={`absolute z-20 hidden group-hover:block px-3 py-1 text-sm bg-black text-white rounded-lg shadow-lg ${positionClasses[position]}`}
        >
          {label}
          <div
            className="absolute w-2.5 h-2.5 bg-black rotate-45"
            style={{
              [position === "top"
                ? "top"
                : position === "bottom"
                  ? "bottom"
                  : position === "left"
                    ? "left"
                    : "right"]: "-0.3rem",
              left: position === "top" || position === "bottom" ? "50%" : undefined,
              top: position === "left" || position === "right" ? "50%" : undefined,
              transform:
                position === "top" || position === "bottom"
                  ? "translateX(-50%)"
                  : "translateY(-50%)",
            }}
          ></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
