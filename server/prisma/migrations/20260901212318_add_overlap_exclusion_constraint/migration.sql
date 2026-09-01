CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Assignment"
  ADD CONSTRAINT no_overlapping_assignments
  EXCLUDE USING gist (
    "technicianId" WITH =,
    tsrange("windowStart", "windowEnd") WITH &&
  )
  WHERE ("removedAt" IS NULL);