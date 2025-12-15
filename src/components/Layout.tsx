import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { useTaskFlattener } from '../hooks/useTaskFlattener';
import { useTaskStore } from '../store/taskStore';
import { TaskCard } from './work/TaskCard';
import { MatrixView } from './views/MatrixView';
import { ScheduleView } from './views/ScheduleView';
import { LayoutGrid, Calendar, Plus } from 'lucide-react';
import clsx from 'clsx';

export const Layout = () => {
    const [view, setView] = useState<'matrix' | 'schedule'>('matrix');
    const { unscheduled } = useTaskFlattener();
    const addTask = useTaskStore(state => state.addTask);

    const handleAddTask = async () => {
        const text = prompt("Enter task name:");
        if (text) await addTask(text);
    };

    return (
        <div className="flex h-screen w-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
            {/* Sidebar - 30% */}
            <aside className="w-[30%] bg-white border-r border-gray-200 flex flex-col shadow-xl z-10">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                    <h1 className="text-2xl font-black tracking-tight text-gray-800">Genesis-G</h1>
                    <button
                        onClick={handleAddTask}
                        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Unscheduled Tasks</h2>
                    <Droppable droppableId="unscheduled">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={clsx(
                                    "min-h-[200px] transition-colors rounded-lg",
                                    snapshot.isDraggingOver ? "bg-blue-50/50 ring-2 ring-blue-100" : ""
                                )}
                            >
                                {unscheduled.map((task, index) => (
                                    <TaskCard key={task.id} task={task} index={index} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </aside>

            {/* Main Stage - 70% */}
            <main className="flex-1 flex flex-col bg-gray-100 relative">
                {/* View Switcher */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-6 justify-between shrink-0 sticky top-0 z-20">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setView('matrix')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                view === 'matrix' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Matrix
                        </button>
                        <button
                            onClick={() => setView('schedule')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                view === 'schedule' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Calendar className="w-4 h-4" />
                            Schedule
                        </button>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden p-6">
                    <div className="h-full w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                        {view === 'matrix' ? <MatrixView /> : <ScheduleView />}
                    </div>
                </div>
            </main>
        </div>
    );
};
