// ─────────────────────────────────────────────────────────
// EventLog — Demonstrates SDK event system
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EventLogProps {
  events: Array<{ type: string; data: string; time: string }>;
}

export function EventLog({ events }: EventLogProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (events.length === 0) return null;

  return (
    <motion.aside
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`event-log ${isMinimized ? 'event-log--minimized' : ''}`}
      aria-label="SDK Event Log"
    >
      <motion.div layout="position" className="event-log-header" onClick={() => setIsMinimized(!isMinimized)}>
        <h3 className="event-log-title">SDK Events ({events.length})</h3>
        <button className="event-log-toggle" type="button">
          {isMinimized ? '▲' : '▼'}
        </button>
      </motion.div>
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ opacity: { duration: 0.2 } }}
            className="event-log-list"
          >
            {events.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="event-log-item"
              >
                <span className={`event-badge event-badge--${event.type}`}>
                  {event.type}
                </span>
                <span className="event-data">{event.data}</span>
                <span className="event-time">{event.time}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
