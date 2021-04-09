import { Publisher, Subjects, TicketCreatedEvent  } from '@ms28tickets/commonlib/build ';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
