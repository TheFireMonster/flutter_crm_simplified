import { Injectable } from '@nestjs/common';
import { CreateAppointmentFromAiDto } from './dto/create-appointment-from-ai.dto';
import { AiActionsService } from '../ai-actions/ai-actions.service';
import { AppointmentsService } from './appointments.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class AppointmentsAiService {
  constructor(
    private aiActionsService: AiActionsService,
    private appointmentsService: AppointmentsService,
    private customersService: CustomersService,
  ) {}

  public async createDraftFromAi(dto: CreateAppointmentFromAiDto) {
    const requestId = dto.requestId || `ai-${Date.now()}`;
    const { inserted, record } = await this.aiActionsService.reserve(requestId, 'create_appointment', dto);

    if (!inserted) {
      if (record?.resultTable === 'appointments' && record?.resultId) {
        // return existing appointment
        const existing = await this.appointmentsService.getAll(); // no findOne, so we return the list and filter
        return existing.find(a => a.id === record.resultId) || record;
      }
      return record;
    }

    // Resolve DTO to the appointments.create signature
    const title = dto.serviceName || 'Appointment';
  const description = dto.notes || '';

    // derive startTime and endTime (HH:MM:SS) from startAt and durationMinutes
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toLocalTimeString = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

    let start = new Date(dto.startAt);
    const duration = (dto.durationMinutes && dto.durationMinutes > 0) ? dto.durationMinutes : 60; // default 60 minutes
    let startTime: string = toLocalTimeString(start);
    let endTime: string | undefined = toLocalTimeString(new Date(start.getTime() + duration * 60000));

    // Safety: if the selected slot overlaps existing appointments, try to find next available slot
    const appointmentDate = dto.startAt.split('T')[0];
    const maxAttempts = 24; // try up to 24 shifts
    let attempts = 0;
    try {
      while (await this.appointmentsService.hasOverlap(appointmentDate, startTime, endTime) && attempts < maxAttempts) {
        // shift start by duration minutes
        start = new Date(start.getTime() + duration * 60000);
        startTime = toLocalTimeString(start);
        endTime = toLocalTimeString(new Date(start.getTime() + duration * 60000));
        attempts++;
      }
    } catch (e) {
      // if overlap check fails for any reason, continue with original times (best-effort)
      console.error('Error checking appointment overlap, proceeding with original time', e);
    }

    const created = await this.appointmentsService.create({
      title,
      description,
      appointmentDate,
  startTime: startTime,
  endTime: endTime,
      duration: duration,
      location: undefined,
      customerId: dto.customerId,
    });

    // normalize created result (could be Appointment or Appointment[] depending on repo behavior)
    const createdEntity = Array.isArray(created) ? created[0] : created;
    const createdId = createdEntity ? (createdEntity as any).id : null;

    if (createdId) {
      await this.aiActionsService.finalize(requestId, 'appointments', createdId);
    }

    // If this appointment was created for a chat lead, mark that customer as a converted customer
    try {
      if (dto.customerId) {
        await this.customersService.update(dto.customerId, { source: 'chat-customer' } as any);
      }
    } catch (e) {
      // Best-effort: don't fail the flow if marking fails
      console.error('Failed to mark customer as chat-customer', e);
    }

    return createdEntity || created;
  }
}
