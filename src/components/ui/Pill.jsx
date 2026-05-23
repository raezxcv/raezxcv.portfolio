import { motion } from "framer-motion";

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function Pill({ children }) {
  return (
    <motion.span
      variants={staggerItem}
      className="pill"
      whileHover={{
        borderColor: "var(--accent-mid)",
        boxShadow: "0 0 16px var(--accent-glow)",
      }}
    >
      {children}
    </motion.span>
  );
}
