import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'asdfas',
        price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`)
    .send({
        title: 'asdfas',
        price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own a ticket', async () => {
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({
        title: 'asdfas',
        price: 20,
    });

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'asdfasfsf',
        price: 30,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or path', async () => {
    const cookie = global.signin();
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
        title: 'asdfas',
        price: 20,
    });

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: '',
        price: 30,
    })
    .expect(400);

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'asdfaslkf',
        price: -10,
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
        title: 'asdfas',
        price: 20,
    });

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'fasfsafsdje',
        price: 30,
    })
    .expect(200);

    const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send();
    
    expect(ticketResponse.body.title).toEqual('fasfsafsdje');
    expect(ticketResponse.body.price).toEqual(30);
});


it('publishes an event', async () => {
    const cookie = global.signin();
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
        title: 'asdfas',
        price: 20,
    });

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'fasfsafsdje',
        price: 30,
    })
    .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});


it('rejects the update if ticket is reserved', async () => {
    const cookie = global.signin();
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
        title: 'asdfas',
        price: 20,
    });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });

    await ticket!.save();

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'fasfsafsdje',
        price: 30,
    })
    .expect(400);
});