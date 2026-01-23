import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPoints(points: number): string {
  return points.toLocaleString('es-ES');
}

export function getAgeBasedPoints(age: number): {
  min: number;
  max: number;
  suggested: number[];
} {
  if (age <= 5) {
    return { min: 5, max: 20, suggested: [5, 10, 15, 20] };
  } else if (age <= 9) {
    return { min: 10, max: 50, suggested: [10, 20, 30, 50] };
  } else if (age <= 14) {
    return { min: 20, max: 100, suggested: [20, 50, 75, 100] };
  } else {
    return { min: 30, max: 200, suggested: [30, 50, 100, 150, 200] };
  }
}

export function calculateStreak(lastDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastDate);
  last.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 1 ? diffDays : 0;
}
