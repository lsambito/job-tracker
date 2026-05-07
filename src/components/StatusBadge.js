import React from 'react';
import { getStatusMeta } from '../lib/store';

const BG_ALPHA = '22';

export default function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      background: meta.color + BG_ALPHA,
      color: meta.color,
      border: `1px solid ${meta.color}44`,
    }}>
      {meta.label}
    </span>
  );
}
