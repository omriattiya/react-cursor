# Click Effect is Provider-scoped

Trail and Velocity Effect are per-style options on Custom Cursor. Click Effect is configured on the Provider instead, so it can run even when a Native Cursor is active — the visual is spawned at the press point, not tied to a custom cursor look. Rejected alternative: per-style config mirroring Trail/Velocity (simpler consistency, but no press feedback under Native Cursor).
