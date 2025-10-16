import { useCallback } from 'react';

export function useAssignmentView() {
  const markAsViewed = useCallback(async (assignmentId: string, classId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, classId, action: 'view' })
      });

      if (!response.ok) {
        console.error('Failed to mark assignment as viewed');
      }
    } catch (error) {
      console.error('Error marking assignment as viewed:', error);
    }
  }, []);

  return { markAsViewed };
}
