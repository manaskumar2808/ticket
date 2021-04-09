import { PaymentCreatedEvent, Publisher, Subjects } from "@ms28tickets/commonlib/build ";


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}