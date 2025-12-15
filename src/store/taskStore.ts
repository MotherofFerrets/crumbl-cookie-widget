
import { create } from 'zustand';
import type { Task } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, Timestamp, deleteDoc } from 'firebase/firestore';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;

    // Actions
    subscribeToTasks: () => () => void;
    addTask: (content: string, parentId?: string | null) => Promise<string>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    moveTaskToMatrix: (id: string, quadrant: Task['matrix']['quadrant']) => Promise<void>;
    moveTaskToSchedule: (id: string, date: string, time: string) => Promise<void>;
    moveTaskToUnscheduled: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
    tasks: [],
    isLoading: true,

    subscribeToTasks: () => {
        const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Task));
            set({ tasks, isLoading: false });
        }, (error) => {
            console.error("Firestore subscription error:", error);
            set({ isLoading: false });
        });
        return unsubscribe;
    },

    addTask: async (content, parentId = null) => {
        // @ts-ignore - formatting date
        const newTask: Omit<Task, 'id'> = {
            userId: 'test-user', // Placeholder
            parentId,
            content,
            status: 'not-started',
            matrix: { quadrant: null, rank: 0 },
            schedule: { date: null, time: null, duration: 60 },
            createdAt: Timestamp.now()
        };

        // @ts-ignore
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        return docRef.id;
    },

    updateTask: async (id, updates) => {
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, updates);
    },

    deleteTask: async (id) => {
        await deleteDoc(doc(db, 'tasks', id));
    },

    moveTaskToMatrix: async (id, quadrant) => {
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, {
            'matrix.quadrant': quadrant,
            'schedule.date': null,
            'schedule.time': null
        });
    },

    moveTaskToSchedule: async (id, date, time) => {
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, {
            'schedule.date': date,
            'schedule.time': time,
            'matrix.quadrant': null
        });
    },

    moveTaskToUnscheduled: async (id) => {
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, {
            'matrix.quadrant': null,
            'schedule.date': null,
            'schedule.time': null
        });
    }
}));
