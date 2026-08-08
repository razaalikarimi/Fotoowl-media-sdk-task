// ─────────────────────────────────────────────────────────
// EventLog — Demonstrates SDK event system
// ─────────────────────────────────────────────────────────

import { useState } from 'react';

interface EventLogProps {
  events: Array<{ type: string; data: string; time: string }>;
}

export function EventLog({ events }: EventLogProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (events.length === 0) return null;

  return (
    <aside className={`event-log ${isMinimized ? 'event-log--minimized' : ''}`} aria-label="SDK Event Log">
      <div className="event-log-header" onClick={() => setIsMinimized(!isMinimized)}>
        <h3 className="event-log-title">SDK Events ({events.length})</h3>
        <button className="event-log-toggle" type="button">
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>
      {!isMinimized && (
        <div className="event-log-list">
          {events.map((event, i) => (
            <div key={i} className="event-log-item">
              <span className={`event-badge event-badge--${event.type}`}>
                {event.type}
              </span>
              <span className="event-data">{event.data}</span>
              <span className="event-time">{event.time}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
