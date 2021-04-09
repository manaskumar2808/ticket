import { OrderStatus } from '@ms28tickets/commonlib/build ';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'asdklds',
        orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);

});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        userId: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created, 
    });

    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'asdklds',
        orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        userId,
        status: OrderStatus.Cancelled, 
    });

    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'asdklds',
        orderId: order.id,
    })
    .expect(400);
});


it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price,
        userId,
        status: OrderStatus.Created, 
    });

    await order.save(); 

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'tok_visa',
        orderId: order.id,
    })
    .expect(201); 

    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === price*100);

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge?.currency).toEqual('inr');
    
    const payment = await Payment.findOne({ orderId: order.id, stripeId: stripeCharge!.id });

    expect(payment).not.toBeNull();
});
