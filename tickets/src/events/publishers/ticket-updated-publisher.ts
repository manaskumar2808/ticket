import { Publisher, Subjects, TicketUpdatedEvent  } from '@ms28tickets/commonlib/build ';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
