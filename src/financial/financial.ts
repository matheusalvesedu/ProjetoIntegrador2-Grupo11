import { Request, RequestHandler, Response } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv';

dotenv.config();

export namespace FinancialManager {

    export async function getWallet(ownerEmail: string): Promise<number | undefined> {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        const connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            'SELECT balance FROM accounts WHERE email = :ownerEmail',
            [ownerEmail]
        );

        if (result.rows && result.rows.length > 0) {
            const balance = (result.rows[0] as { BALANCE: number }).BALANCE;
            await connection.close();
            return balance;
        } else {
            await connection.close();
            return undefined;
        }
    }

    export const getWalletHandler: RequestHandler = async (req: Request, res: Response) => {
        const userEmail = req.user?.email;

        if (userEmail) {
            const balance = await getWallet(userEmail);
            if (balance) {
                res.statusCode = 200;
                res.send(`R$${balance}`);
            } else {
                res.statusCode = 400;
                res.send(`Carteira não encontrada para o email: ${userEmail}`);
            }
        }
    }

    async function getAccountID(ownerEmail: string): Promise<number | undefined> {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        const connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            'SELECT id FROM accounts WHERE email = :ownerEmail',
            [ownerEmail]
        );

        if (result.rows && result.rows.length > 0) {
            const id = (result.rows[0] as { ID: number }).ID;
            await connection.close();
            return id;
        } else {
            await connection.close();
            return undefined;
        }
    }

    async function createTransaction(ownerEmail: string, funds: number, transactionType: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const accountId = await getAccountID(ownerEmail);

        if (accountId) {
            await connection.execute(
                `INSERT INTO TRANSACTIONS
                (transaction_id, FK_ACCOUNT_ID, transaction_type, amount)
                VALUES
                (SEQ_ACCOUNTS.NEXTVAL, :accountId, :transactionType, :funds)`,
                { accountId, transactionType ,funds },
                { autoCommit: true }
            );
            await connection.close();
            return true;
        } else {
            await connection.close();
            return false;
        }
    }


    async function addFunds(ownerEmail: string, funds: number) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            'SELECT email FROM accounts WHERE email = :ownerEmail',
            [ownerEmail]
        );

        if (result.rows && result.rows.length > 0) {
            await connection.execute(
                `UPDATE accounts SET balance = balance + :Funds WHERE email = :ownerEmail`,
                { funds, ownerEmail },
                { autoCommit: true }
            );
            await connection.close();
            return true;
        } else {
            return false;
        }

    }

    export const addFundsHandler: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.user?.email;
        const pFunds = req.get('funds');
        const transaction_type = req.get('transactionType');

        if (pEmail && pFunds && transaction_type) {
            const funds = parseFloat(pFunds);
            if (funds > 0 && await addFunds(pEmail, funds)) {
                await createTransaction(pEmail, funds, transaction_type);
                res.status(200).json({ message: 'Depósito concluído com sucesso!' });
            } else {
                res.status(400).json({ error: 'Email incorreto. Não foi possível realizar o depósito' });
            }
        } else {
            res.status(400).json({ error: 'Email ou quantia de depósito não fornecidos' });
        }
    };

    

    async function getTransactions(ownerEmail: string, transactionType: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const accountId = await getAccountID(ownerEmail);

        if (accountId) {
            const result = await connection.execute(
                `SELECT * FROM transactions WHERE FK_ACCOUNT_ID = :accountId AND transaction_type = :transactionType ORDER BY transaction_date DESC`,
                [accountId, transactionType]
            );
            await connection.close();
            return result.rows;
        } else {
            await connection.close();
            return undefined;
        }
    }

    export const getTransactionsHandler: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.user?.email;
        const transactionType = req.get('transactionType');

        if(pEmail && transactionType) {
            const transactions = await getTransactions(pEmail, transactionType);
            if (transactions) {
                res.status(200).json(transactions);
            } else {
                res.status(400).json({ error: 'Email Invalido, não foi possível encontrar as transações' });
            }
        }
    }

    async function withdrawFunds(ownerEmail: string, saque: number) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            'SELECT email FROM accounts WHERE email = :ownerEmail',
            [ownerEmail]
        );

        if (result.rows && result.rows.length > 0) {
            await connection.execute(
                `UPDATE accounts SET balance = balance - :saque WHERE email = :ownerEmail`,
                { saque, ownerEmail },
                { autoCommit: true }
            );
            await connection.close();
            return true;
        } else {
            return false;
        }
    }

    export const withdrawFundsHandler: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.user?.email;
        const pSaque = req.get('saque');
        const transaction_type = req.get('transactionType');

        if (pEmail && pSaque && transaction_type) {
            var saque = parseFloat(pSaque);
            let taxa = 0;

            if (saque <= 100) {
            taxa = saque * 0.04;
            } else if (saque <= 1000) {
            taxa = saque * 0.03;
            } else if (saque <= 5000) {
            taxa = saque * 0.02;
            } else if (saque <= 100000) {
            taxa = saque * 0.01;
            }

            const balance = await getWallet(pEmail);

            if (balance) {
            if (saque > balance) {
                res.status(400).json({ error: 'Saldo insuficiente para realizar o saque' });
                return;
            }
            } else {
            res.status(400).json({ error: 'Saldo não encontrado para o email: ' + pEmail });
            return;
            }

            if (saque > 100000) {
            res.status(400).json({ error: 'Quantia de saque excedeu o limite diário' });
            return;
            }

            if (saque > 0 && await withdrawFunds(pEmail, saque)) {
                const transaction = await createTransaction(pEmail, saque, transaction_type);
                if (transaction){
                    res.status(200).json({ message: 'Saque concluído com sucesso!', saque: saque, recebido: saque - taxa, taxa: taxa });
                } else {
                    res.status(400).json({ error: 'Erro ao criar transação de saque' });
                }
            } else {
            res.status(400).json({ error: 'Quantia de saque inválida ou email não encontrado' });
            }
        } else {
            res.status(400).json({ error: 'Email ou quantia de saque não fornecidos' });
            }
        }
    }
