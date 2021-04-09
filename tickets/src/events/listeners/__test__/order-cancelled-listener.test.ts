import mongoose from 'mongoose';
import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent, OrderStatus } from "@ms28tickets/commonlib/build ";
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'concert', 
        price: 200,
        userId: 'asfasfew',
    });

    ticket.set({ orderId });

    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,        
        ticket: {
            id: ticket.id,
        },
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, ticket, orderId, data, msg };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
    const { msg, data, listener, orderId, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

