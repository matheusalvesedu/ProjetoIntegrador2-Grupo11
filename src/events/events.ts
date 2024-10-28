import { Request, RequestHandler, Response } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 

dotenv.config();

export namespace EventsHandler {

    export type Event = {
        eventId: number;
        eventTitle: string;
        eventDescription: string;
        eventStartDate: string;
        eventFinalDate: string;
        eventStatus: string;
    };

    async function addNewEvent(eventTitle: string, eventDescription: string, eventStart: string, eventFinal: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        // Conectar ao banco de dados
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        
        await connection.execute(
            `INSERT INTO EVENTS(
            event_id,
            event_title,
            event_description,
            eventStartDate,
            eventFinalDate,
            event_status
            ) VALUES (
            SEQ_EVENTS.NEXTVAL,
            :eventTitle,
            :eventDescription,
            :eventStart,
            :eventFinal,
            'Pendente'
            )`,
            [eventTitle, eventDescription, eventStart, eventFinal]
        );

        await connection.execute('commit');
        await connection.close();
        }

    // Handler para processar a requisição de adicionar eventos
    export const addNewEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const eventTitle = req.get('event_title');
        const eventDescription = req.get('event_description');
        const eventStartDate = req.get('eventStartDate');
        const eventFinalDate = req.get('eventFinalDate');

        // Verifica se os parâmetros obrigatórios foram enviados
        if (eventTitle && eventDescription && eventStartDate && eventFinalDate) {
            await  addNewEvent(eventTitle, eventDescription, eventStartDate, eventFinalDate);
            res.status(201).send('Evento Criado Com Sucesso. Aguarde a Aprovação.');
        } else {
            res.status(400).send('Parâmetros Faltando.');
        }
    };

    async function deleteEvent(eventId: number){
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            `UPDATE EVENTS SET event_status = 'Excluído' WHERE EVENT_ID = :eventId` ,
            [eventId]
        );

        await connection.commit();
        await connection.close();
    }

    export const deleteEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const eventId = req.get('event_id');
        if (eventId) {
            const id = parseFloat(eventId);
            await deleteEvent(id);
            res.status(200).send('Evento Excluído Com Sucesso.');
        } else {
            res.status(400).send('Parâmetros Faltando.');
        }
    }

    async function evaluateEvent(eventId: number, event_status: string, desc: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            'UPDATE EVENTS SET event_status = :event_status WHERE event_id = :eventId',
            [event_status, eventId],
            {autoCommit: true}
        );

        
        await connection.close();    
    }

    export const evaluateEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const eventId = req.get('event_id');
        const eventStatus = req.get('event_status');
        const textMessage = req.get('message');

        if (eventId && eventStatus && textMessage) {
            const id = parseInt(eventId);
            await evaluateEvent(id, eventStatus, textMessage);
            res.status(200).send(`Evento ${eventStatus}, ${textMessage}`);
        } else {
            res.status(400).send('Parâmetros Faltando.');
        }
    }
}
// searchEvent (Serviço que permite fazer busca de eventos por palavras-chave) para ser
// usado justamente na homepage do site.)


