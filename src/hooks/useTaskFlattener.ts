import { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../types';

export interface AugmentedTask extends Task {
    virtual: {
        effectiveQuadrant: Task['matrix']['quadrant'];
        depth: number;
    };
}

export const useTaskFlattener = () => {
    const tasks = useTaskStore(state => state.tasks);

    return useMemo(() => {
        const taskMap = new Map(tasks.map(t => [t.id, t]));

        // Inheritance Logic
        const getEffectiveQuadrant = (task: Task): Task['matrix']['quadrant'] => {
            if (task.matrix.quadrant) return task.matrix.quadrant;
            if (task.parentId && taskMap.has(task.parentId)) {
                return getEffectiveQuadrant(taskMap.get(task.parentId)!);
            }
            return null;
        };

        // Depth Logic (for indentation)
        const getDepth = (task: Task): number => {
            let depth = 0;
            let current = task;
            while (current.parentId && taskMap.has(current.parentId)) {
                depth++;
                current = taskMap.get(current.parentId)!;
            }
            return depth;
        };

        const augTasks: AugmentedTask[] = tasks.map(task => ({
            ...task,
            virtual: {
                effectiveQuadrant: getEffectiveQuadrant(task),
                depth: getDepth(task)
            }
        }));

        return {
            all: augTasks,
            matrix: {
                mustDo: augTasks.filter(t => t.virtual.effectiveQuadrant === 'must-do'),
                doNext: augTasks.filter(t => t.virtual.effectiveQuadrant === 'do-next'),
                waiting: augTasks.filter(t => t.virtual.effectiveQuadrant === 'waiting'),
                doLater: augTasks.filter(t => t.virtual.effectiveQuadrant === 'do-later'),
            },
            schedule: augTasks.filter(t => t.schedule.date !== null).sort((a, b) => (a.schedule.time || '').localeCompare(b.schedule.time || '')),
            unscheduled: augTasks.filter(t => !t.virtual.effectiveQuadrant && !t.schedule.date)
        };
    }, [tasks]);
};
