import {Request, RequestHandler, Response} from "express";

export namespace EventsHandler {
    
    export type Event = {
        eventId: number;
        eventName: string;
        eventDescripction: string;
        eventDate: string;
    };

    function addNewEvent(event: Event) {
        console.log(event);
    };
}