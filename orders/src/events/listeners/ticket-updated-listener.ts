import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent, NotFoundError } from '@ms28tickets/commonlib/build ';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);

        const { id, title, price } = data;

        if(!ticket) {
            throw new Error('Ticket not found!');
        }

        ticket.set({
            title,
            price,
        });

        await ticket.save();

        msg.ack();
    }
}