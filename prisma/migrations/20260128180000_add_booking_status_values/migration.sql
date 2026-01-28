-- Add new enum values safely
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'UPCOMING';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
