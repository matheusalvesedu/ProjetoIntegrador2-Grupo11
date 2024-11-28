import { Request, RequestHandler, Response } from "express";
import { FinancialManager } from "../financial/financial";
import OracleDB from "oracledb";
import dotenv from 'dotenv';
dotenv.config();

export namespace EventsHandler {

    async function addNewEvent(eventTitle: string, eventDescription: string, eventStart: string, eventFinal: string, FK_ACCOUNT_ID: number, eventDate: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

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
            FK_ACCOUNT_ID,
            eventDate
            ) VALUES (
            SEQ_EVENTS.NEXTVAL,
            :eventTitle,
            :eventDescription,
            :eventStart,
            :eventFinal,
            'pendente',
            :FK_ACCOUNT_ID,
            :eventDate
            )`,
            {
                eventTitle: eventTitle,
                eventDescription: eventDescription,
                eventStart: eventStart,
                eventFinal: eventFinal,
                FK_ACCOUNT_ID: FK_ACCOUNT_ID,
                eventDate: eventDate
            }
        );

        await connection.execute('commit');
        await connection.close();
    }

    export const addNewEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const eventTitle = req.get('event_title');
        const eventDescription = req.get('event_description');
        const eventStartDate = req.get('eventStartDate');
        const eventFinalDate = req.get('eventFinalDate');
        const eventDate = req.get('eventDate');
        const pFK_ID = req.user?.id;
        if (eventTitle && eventDescription && eventStartDate && eventFinalDate && pFK_ID && eventDate) {
            await addNewEvent(eventTitle, eventDescription, eventStartDate, eventFinalDate, pFK_ID, eventDate);
            res.status(201).json({ message: 'Evento Criado Com Sucesso. Aguarde a Aprovação.' });
        } else {
            res.status(400).json({ message: 'Parâmetros Faltando.' });
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
            `UPDATE EVENTS SET event_status = 'excluído' WHERE EVENT_ID = :eventId`,
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
            res.status(200).json({ message: 'Evento Excluído Com Sucesso.' });
        } else {
            res.status(400).json({ message: 'Parâmetros Faltando.' });
        }
    }


    async function validateEvent(eventId: number) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let result = await connection.execute(
            `SELECT * FROM EVENTS WHERE event_id = :eventId`,
            [eventId]
        );

        if (result.rows && result.rows.length > 0) {
            await connection.close();
            return true;
        } else {
            await connection.close();
            return false;
        }

    }

    async function evaluateEvent(eventId: number, event_status: string, category: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        const connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            'UPDATE EVENTS SET event_status = :event_status WHERE event_id = :eventId',
            [event_status, eventId],
            { autoCommit: true }
        );

        await connection.execute(
            'UPDATE EVENTS SET category = :category WHERE event_id = :eventId',
            [category, eventId],
            { autoCommit: true }
        );

        return;
    }

    export const evaluateEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const eventId = req.get('event_id');
        const eventStatus = req.get('event_status');
        const textMessage = req.get('message');
        const category = req.get('category');

        if (eventId && eventStatus && textMessage && category) {
            const id = parseInt(eventId);
            const validacao = await validateEvent(id);
            if (!validacao) {
                res.status(404).json({ message: 'Evento não encontrado.' });
                return;
            }
            await evaluateEvent(id, eventStatus, category);
            res.status(200).json({ message: `Evento ${eventStatus}, ${textMessage}` });
        } else {
            res.status(400).json({ message: 'Parâmetros Faltando.' });
        }
    }

    async function searchEvents(keyword: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let result = await connection.execute(
            `SELECT * FROM EVENTS WHERE (event_title LIKE '%${keyword}%' OR event_description LIKE '%${keyword}%' OR category LIKE '%${keyword}%') AND event_status = 'Aprovado'`
        );

        await connection.close();

        if (result.rows && result.rows.length > 0) {
            return result.rows;
        } else {
            return;
        }
    }

    export const searchEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const keyword = req.get('keyword');
        if (keyword) {
            const events = await searchEvents(keyword);
            res.status(200).json(events);
        } else {
            res.status(400).json({ message: 'Parâmetros Faltando.' });
        }
    };

    async function getEvents(status_event: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let result = await connection.execute(
            `SELECT * FROM EVENTS WHERE event_status = '${status_event}' ORDER BY EVENT_ID DESC`
        );

        await connection.close();
        return result.rows;
    }

    export const getEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const status_event = req.get('status_event');
        if (status_event) {
            const events = await getEvents(status_event);
            res.status(200).json(events);
        } else {
            res.status(400).json({ message: 'Parâmetros Faltando.' });
        }
    };


    async function getBets(email: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let result = await connection.execute(
            `SELECT * FROM BETS WHERE FK_ACCOUNT_EMAIL = :email`,
            [email]
        );

        await connection.close();
        return result.rows;
    }

    export const getBetsHandler: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.user?.email;
        if (pEmail) {
            const bets = await getBets(pEmail);
            res.status(200).json(bets);
        } else {
            res.status(400).json({ message: 'Parâmetros Faltando.' });
        }
    }

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
            bet_status,
            FK_EVENT_ID
            ) VALUES (
            SEQ_BETS.NEXTVAL,
            :bet_value,
            :bet_option,
            :email,
            'EM ANDAMENTO',
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

    async function verifyAccount(email: string): Promise<boolean> {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let result = await connection.execute(
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
        const pemail = req.user?.email;
        const bet_value = req.get('bet_value');
        const bet_option = req.get('bet_option');

        // adicionar verificaçao se o evento esta com status de aprovado

        if (event_id && pemail && bet_value && bet_option) {
            if (parseFloat(bet_value) >= 1) {
                if (await verifyAccount(pemail)) {
                    const walletBalance = await FinancialManager.getWallet(pemail);
                    if (walletBalance) {
                        if (walletBalance < parseFloat(bet_value)) {
                            res.status(400).json({ message: 'Saldo Insuficiente.' });
                        } else {
                            await betOnEvents(parseInt(event_id), pemail, parseFloat(bet_value), bet_option);
                            res.status(201).json({ message: 'Aposta Realizada Com Sucesso.' });
                        }
                    } else {
                        res.status(400).json({ message: 'Saldo não encontrado.' });
                    }
                } else {
                    res.status(404).json({ message: 'Conta não encontrada.' });
                }
            } else {
                res.status(400).json({ message: 'Valor da Aposta Inválido. Por Favor, insira mais que R$1,00.' });
            }
        } else {
            res.status(400).json({ message: 'Parâmetros Faltando.' });
        }
    };

    async function finishEvent(event_id: number, event_verdict: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            `UPDATE EVENTS SET event_status = 'finalizado' WHERE event_id = :event_id`,
            [event_id]
        );

        await connection.execute(
            `UPDATE EVENTS SET verdict = :event_verdict WHERE event_id = :event_id`,
            [event_verdict, event_id]
        );
        await connection.execute(
            `UPDATE EVENTS SET amount_wins = (SELECT SUM(bet_value) FROM BETS WHERE FK_EVENT_ID = :event_id AND bet_option = :event_verdict) WHERE event_id = :event_id`,
            { event_id: event_id, event_verdict: event_verdict }
        );

        await connection.execute(
            `UPDATE EVENTS SET amount_loses = (SELECT SUM(bet_value) FROM BETS WHERE FK_EVENT_ID = :event_id AND bet_option != :event_verdict) WHERE event_id = :event_id`,
            { event_id: event_id, event_verdict: event_verdict }
        );

        const lowerCaseVerdict = event_verdict.toLowerCase();

        await connection.execute(
            `UPDATE BETS 
             SET bet_status = CASE 
                 WHEN bet_option = :lowerCaseVerdict THEN 'GANHOU'
                 ELSE 'PERDEU' 
             END
             WHERE FK_EVENT_ID = :event_id`,
            { event_id: event_id, lowerCaseVerdict: lowerCaseVerdict }
        );
        await connection.commit();


        await connection.close();
        return true;
    }

    async function distributeValues(event_id: number, event_verdict: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const lowerCaseVerdict = event_verdict.toLowerCase();

        const result = await connection.execute(
            `SELECT BET_VALUE, FK_ACCOUNT_EMAIL 
            FROM BETS 
            WHERE FK_EVENT_ID = :event_id 
            AND BET_OPTION = :lowerCaseVerdict`,
            { event_id, lowerCaseVerdict }
        );


        if (result.rows && result.rows.length > 0) {
            // Calcular o prêmio para cada vencedor
            for (const row of result.rows) {
                const result_amount_wins = await connection.execute(
                    `SELECT SUM(BET_VALUE) AS TOTAL FROM BETS WHERE FK_EVENT_ID = :event_id AND BET_OPTION = :lowerCaseVerdict`,
                    { event_id: event_id, lowerCaseVerdict: lowerCaseVerdict }
                );
                const result_amount_loses = await connection.execute(
                    `SELECT SUM(BET_VALUE) AS TOTAL FROM BETS WHERE FK_EVENT_ID = :event_id AND BET_OPTION != :lowerCaseVerdict`,
                    { event_id: event_id, lowerCaseVerdict: lowerCaseVerdict }
                );
                if ((result_amount_wins.rows && result_amount_wins.rows.length > 0) && (result_amount_loses.rows && result_amount_loses.rows.length > 0)) {
                    const amount_wins = (result_amount_wins.rows[0] as any).TOTAL;
                    const amount_loses = (result_amount_loses.rows[0] as any).TOTAL;

                    if (typeof row === 'object' && row !== null) {
                        let betValue = (row as any).BET_VALUE; // Valor da aposta de cada vencedor
                        let email = (row as any).FK_ACCOUNT_EMAIL; // Email do usuário vencedor

                        // Calcular a proporção e o prêmio individual
                        var proportion = betValue / amount_wins;
                        const prize = amount_loses * proportion;

                        // Atualizar o saldo do vencedor com o prêmio calculado
                        await connection.execute(
                            `UPDATE ACCOUNTS 
                        SET balance = balance + :prize + :betValue
                        WHERE email = :email`,
                            { prize: prize, email: email, betValue: betValue }
                        );
                    }
                }
            }

            await connection.commit();
            await connection.close();
            return true;
        }
    }

    export const finishEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const event_id = req.get('event_id');
        const event_verdict = req.get('event_verdict');

        if (event_id && event_verdict) {
            const finish = await finishEvent(parseInt(event_id), event_verdict);
            if (finish) {
                const distribute = await distributeValues(parseInt(event_id), event_verdict);
                if (distribute) {
                    res.status(200).json({ message: 'Evento Finalizado Com Sucesso.' });
                } else {
                    res.status(400).json({ message: 'Erro ao distribuir dinheiro.' });
                }

            } else {
                res.status(400).json({ message: 'Erro ao finalizar evento.' });
            }
        } else {
            res.status(400).json({ message: 'Parâmetros Faltando.' });
        }
    }

    async function getEventsByTotalBets() {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let result = await connection.execute(
            `SELECT 
                E.EVENT_ID, 
                E.EVENT_TITLE, 
                E.EVENT_DESCRIPTION,
                E.EVENTSTARTDATE,
                E.EVENTFINALDATE,
                E.EVENTDATE,
                E.CATEGORY,
                COUNT(B.BET_ID) AS TOTAL_BETS
            FROM 
                EVENTS E
            JOIN 
                BETS B ON E.EVENT_ID = B.FK_EVENT_ID
            WHERE 
                B.BET_STATUS = 'EM ANDAMENTO' AND E.EVENT_STATUS = 'Aprovado'
            GROUP BY 
                E.EVENT_ID, 
                E.EVENT_TITLE, 
                E.EVENT_DESCRIPTION,
                E.EVENTSTARTDATE,
                E.EVENTFINALDATE,
                E.EVENTDATE,
                E.CATEGORY
            ORDER BY 
                TOTAL_BETS DESC`
        );

        await connection.close();
        return result.rows;
    }

    export const getEventsByTotalBetsHandler: RequestHandler = async (req: Request, res: Response) => {
        try {
            const events = await getEventsByTotalBets();
            if (events) {
                res.status(200).json(events);
            } else {
                res.status(404).json({ message: 'Eventos não encontrados.' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar eventos .' });
        }
    }


    async function getEventsDate() {
        try {
            OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;
            let connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });
            let result = await connection.execute(
                `SELECT 
                    E.EVENT_ID, 
                    E.EVENT_TITLE, 
                    E.EVENT_DESCRIPTION,
                    E.EVENTSTARTDATE,
                    E.EVENTFINALDATE,
                    E.EVENTDATE,
                    E.CATEGORY
                FROM 
                    EVENTS E
                WHERE 
                    TO_DATE(E.EVENTFINALDATE, 'YYYY-MM-DD') >= TRUNC(SYSDATE) AND 
                    E.EVENT_STATUS = 'Aprovado'
                ORDER BY 
                    TO_DATE(E.EVENTFINALDATE, 'YYYY-MM-DD') ASC`
            );
            await connection.close();
            return result.rows;
        } catch (error) {
            return undefined;
        }
    }

    export const getEventsDateHandler: RequestHandler = async (req: Request, res: Response) => {

        const events = await getEventsDate();
        if (events) {
            res.status(200).json(events);
        } else {
            res.status(404).json({ message: 'Eventos não encontrados.' });
        }
    }
}

