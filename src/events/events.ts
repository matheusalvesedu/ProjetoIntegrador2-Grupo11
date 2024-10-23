import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();

export namespace EventsHandler {
    
    export type Event = {
        eventId: number;
        eventTitle: string;
        eventDescripction: string;
        eventDate: string;
        eventStatus: string;
    };

    export const getEventsHandler : RequestHandler =
    async (req: Request, res: Response) => {
        
        
    }
    async function getEvents(eventStatus: string){
        let eventsList: Event[] = [];

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let eventList = connection.execute(
            'SELECT * FROM EVENTS WHERE eventStatus = :eventStatus',
            [eventStatus]
        );

        return eventsList;
    }   
}
