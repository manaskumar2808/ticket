import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from "@ms28tickets/commonlib/build ";
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 10,
        userId: 'fwefws',
        status: OrderStatus.Created,
    });

    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'fwfwaf',
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }


    return { listener, order, data, msg };
}

it('update the status of the order', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('acks the message', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});