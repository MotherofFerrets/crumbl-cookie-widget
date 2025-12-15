import { Droppable } from '@hello-pangea/dnd';
import { useTaskFlattener } from '../../hooks/useTaskFlattener';
import { TaskCard } from '../work/TaskCard';
import clsx from 'clsx';

export const MatrixView = () => {
    const { matrix } = useTaskFlattener();

    const renderQuadrant = (id: string, title: string, tasks: any[], colorClass: string) => (
        <div className={clsx("flex flex-col h-full bg-gray-50 rounded-lg p-4 border-t-4 shadow-sm", colorClass)}>
            <h3 className="font-bold text-gray-700 mb-4">{title}</h3>
            <Droppable droppableId={`matrix-${id}`}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={clsx(
                            "flex-1 overflow-y-auto min-h-[100px] transition-colors rounded-md",
                            snapshot.isDraggingOver ? "bg-gray-100/50 ring-2 ring-inset ring-gray-200" : ""
                        )}
                    >
                        {tasks.map((task, idx) => (
                            <TaskCard key={task.id} task={task} index={idx} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );

    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full p-6 bg-white/50">
            {renderQuadrant('must-do', 'Must Do', matrix.mustDo, 'border-red-500')}
            {renderQuadrant('do-next', 'Do Next', matrix.doNext, 'border-orange-500')}
            {renderQuadrant('waiting', 'Waiting', matrix.waiting, 'border-purple-500')}
            {renderQuadrant('do-later', 'Do Later', matrix.doLater, 'border-blue-500')}
        </div>
    );
};
