import { useEffect } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Layout } from './components/Layout';
import { useTaskStore } from './store/taskStore';
import { format } from 'date-fns';

function App() {
  const { subscribeToTasks, moveTaskToMatrix, moveTaskToSchedule, moveTaskToUnscheduled } = useTaskStore();

  useEffect(() => {
    const unsubscribe = subscribeToTasks();
    return () => unsubscribe();
  }, [subscribeToTasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const taskId = draggableId;
    const destId = destination.droppableId;

    // Logic Dispatcher
    // Scenario A: To Matrix
    if (destId.startsWith('matrix-')) {
      const quadrant = destId.replace('matrix-', '') as any;
      moveTaskToMatrix(taskId, quadrant);
    }
    // Scenario B: To Schedule
    else if (destId.startsWith('schedule-')) {
      const time = destId.replace('schedule-', '');
      // Default to today for demo purposes
      const today = format(new Date(), 'yyyy-MM-dd');
      moveTaskToSchedule(taskId, today, time);
    }
    // Scenario C: To Unscheduled or anything else (Sidebar)
    else if (destId === 'unscheduled') {
      moveTaskToUnscheduled(taskId);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Layout />
    </DragDropContext>
  );
}

export default App;
