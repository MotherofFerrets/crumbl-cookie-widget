export interface Task {
    id: string;
    userId: string;
    parentId: string | null;
    content: string;
    status: 'not-started' | 'in-progress' | 'complete';

    matrix: {
        quadrant: 'must-do' | 'do-next' | 'waiting' | 'do-later' | null;
        rank: number;
    };

    schedule: {
        date: string | null; // ISO Date String "YYYY-MM-DD"
        time: string | null; // 24h format "HH:mm"
        duration: number; // minutes
    };

    createdAt: any; // Firestore Timestamp
}
