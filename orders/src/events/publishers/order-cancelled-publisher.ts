import { OrderCancelledEvent, Publisher, Subjects } from "@ms28tickets/commonlib/build ";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}