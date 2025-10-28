export declare class Appointment {
    id: number;
    title: string;
    description: string;
    appointmentDate: Date;
    startTime: string;
    endTime: string;
    duration?: number;
    location?: string;
    customerId?: number;
    customerName?: string;
    updatedAt: Date;
}
