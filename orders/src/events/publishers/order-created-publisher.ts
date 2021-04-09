import { Publisher, OrderCreatedEvent, Subjects  } from "@ms28tickets/commonlib/build ";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}