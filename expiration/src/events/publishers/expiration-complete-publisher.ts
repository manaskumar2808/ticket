import { ExpirationCompleteEvent, Publisher, Subjects } from "@ms28tickets/commonlib/build ";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete  = Subjects.ExpirationComplete;
}