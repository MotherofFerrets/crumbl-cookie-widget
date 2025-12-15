import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { AugmentedTask } from '../../hooks/useTaskFlattener';
import { GripVertical } from 'lucide-react';
import clsx from 'clsx';

interface TaskCardProps {
    task: AugmentedTask;
    index: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={clsx(
                        "group flex items-center gap-2 p-2 rounded-md mb-2 bg-white shadow-sm border border-gray-100 select-none",
                        snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500/20 z-50" : "hover:border-gray-300",
                        task.virtual.depth > 0 && "ml-4" // Simple indentation visualization
                    )}
                    style={{
                        ...provided.draggableProps.style,
                        marginLeft: `${task.virtual.depth * 1.5}rem` // Dynamic indentation
                    }}
                >
                    <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    <div className="flex-1 text-sm text-gray-700">
                        {task.content}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                        {task.schedule.time || ''}
                    </div>
                </div>
            )}
        </Draggable>
    );
};
