import { Droppable } from '@hello-pangea/dnd';
import { useTaskFlattener } from '../../hooks/useTaskFlattener';
import { TaskCard } from '../work/TaskCard';

// 6 AM to 11 PM
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);

export const ScheduleView = () => {
    const { schedule } = useTaskFlattener();

    return (
        <div className="h-full overflow-y-auto p-6 space-y-4">
            {HOURS.map(hour => {
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                // Simple filtering for the slot
                const tasksInHour = schedule.filter(t => t.schedule.time?.startsWith(hour.toString().padStart(2, '0')));

                return (
                    <div key={hour} className="flex gap-4 border-b border-gray-100 pb-2 group">
                        <div className="w-16 text-right text-sm text-gray-400 font-mono pt-2">
                            {timeStr}
                        </div>
                        <Droppable droppableId={`schedule-${timeStr}`}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-1 min-h-[60px] rounded-md transition-colors border border-transparent ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-100' : 'group-hover:bg-gray-50'
                                        }`}
                                >
                                    {tasksInHour.map((task, idx) => (
                                        <TaskCard key={task.id} task={task} index={idx} />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                )
            })}
        </div>
    );
};
