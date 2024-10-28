import { Request, RequestHandler, Response } from "express";
import { FinancialManager } from "../financial/financial";
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

    async function addNewEvent(eventTitle: string, eventDescription: string, eventStart: string, eventFinal: string, FK_ACCOUNT_ID: number) {
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
            event_status,
            FK_ACCOUNT_ID
            ) VALUES (
            SEQ_EVENTS.NEXTVAL,
            :eventTitle,
            :eventDescription,
            :eventStart,
            :eventFinal,
            'Pendente',
            :FK_ACCOUNT_ID
            )`,
            {
                eventTitle: eventTitle,
                eventDescription: eventDescription,
                eventStart: eventStart,
                eventFinal: eventFinal,
                FK_ACCOUNT_ID: FK_ACCOUNT_ID
            }
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
        const pFK_ID = req.get('FK_ACCOUNT_ID');

        // Verifica se os parâmetros obrigatórios foram enviados
        if (eventTitle && eventDescription && eventStartDate && eventFinalDate && pFK_ID) {
            await addNewEvent(eventTitle, eventDescription, eventStartDate, eventFinalDate, parseInt(pFK_ID));
            res.status(201).send('Evento Criado Com Sucesso. Aguarde a Aprovação.');
        } else {
            res.status(400).send('Parâmetros Faltando.');
        }
    };

    async function deleteEvent(eventId: number) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            `UPDATE EVENTS SET event_status = 'Excluído' WHERE EVENT_ID = :eventId`,
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
            { autoCommit: true }
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

    async function searchEvents(keyword: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            `SELECT * FROM EVENTS WHERE event_title LIKE '%${keyword}%' OR event_description LIKE '%${keyword}%'`
        );

        await connection.close();
        return result.rows;
    }

    export const searchEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const keyword = req.get('keyword');
        if (keyword) {
            const events = await searchEvents(keyword);
            res.status(200).send(events);
        } else {
            res.status(400).send('Parâmetros Faltando.');
        }
    };


    async function getEvents(status_event: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            `SELECT * FROM EVENTS WHERE event_status = '${status_event}'`
        );

        await connection.close();
        return result.rows;
    }

    export const getEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const status_event = req.get('status_event');
        if (status_event) {
            const events = await getEvents(status_event);
            res.status(200).send(events);
        } else {
            res.status(400).send('Parâmetros Faltando.');
        }
    };

    async function betOnEvents(event_id: number, email: string, bet_value: number, bet_option: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            `INSERT INTO BETS(
            bet_id,
            bet_value,
            bet_option,
            FK_ACCOUNT_EMAIL,
            FK_EVENT_ID
            ) VALUES (
            SEQ_BETS.NEXTVAL,
            :bet_value,
            :bet_option,
            :email,
            :event_id    
            )`,
            {
                bet_value: bet_value,
                bet_option: bet_option,
                email: email,
                event_id: event_id
            }
        );

        await connection.execute(
            'UPDATE ACCOUNTS SET balance = balance - :bet_value WHERE email = :email',
            {
                bet_value: bet_value,
                email: email
            }
        );

        await connection.commit();
        await connection.close();
    };

    async function verifyAccount(email: string) : Promise<boolean> {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            `SELECT * FROM ACCOUNTS WHERE email = :email`,
            [email]
        );

        if (result.rows && result.rows.length > 0) {
            return true;
        } else {
            return false;
        }
    }


    export const betOnEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const event_id = req.get('event_id');
        const pemail = req.get('email');
        const bet_value = req.get('bet_value');
        const bet_option = req.get('bet_option');

        if (event_id && pemail && bet_value && bet_option) {
            if (await verifyAccount(pemail)) {
                const walletBalance = await FinancialManager.getWallet(pemail);
                if (walletBalance) {
                    if (walletBalance < parseFloat(bet_value) && parseFloat(bet_value) >= 1) {
                        res.status(400).send('Saldo Insuficiente .');
                    } else {
                        await betOnEvents(parseInt(event_id), pemail, parseFloat(bet_value), bet_option);
                        res.status(201).send('Aposta Realizada Com Sucesso.');
                    }
                } else {
                    res.status(400).send('Saldo não encontrado.');
                }
            } else {
                res.status(404).send('Conta não encontrada.');
            }
        } else{
            res.status(400).send('Parâmetros Faltando.');
        }
    };
}
