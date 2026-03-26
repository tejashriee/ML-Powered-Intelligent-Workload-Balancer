import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function calculateWorkload(tasks: any[]): number {
  return tasks.reduce((total, task) => {
    if (task.status !== 'completed') {
      return total + (task.estimatedHours || 0)
    }
    return total
  }, 0)
}

export function getTaskPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return 'text-red-600 bg-red-50'
    case 'high': return 'text-orange-600 bg-orange-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'low': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-50'
    case 'in-progress': return 'text-blue-600 bg-blue-50'
    case 'pending': return 'text-gray-600 bg-gray-50'
    case 'overdue': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}
