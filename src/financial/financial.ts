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
                res.send(`Saldo da carteira encontrado: R$${balance}`);
            } else {
                res.statusCode = 400;
                res.send(`Carteira não encontrada para o email: ${userEmail}`);
            }
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
        const pEmail = req.get('email');
        const pFunds = req.get('funds');

        if (pEmail && pFunds) {
            const funds = parseFloat(pFunds);
            if (funds > 0 && await addFunds(pEmail, funds)) {
                res.status(200).send(`Depósito concluído com sucesso!`);
            } else {
                res.status(400).send('Email incorreto. Não foi possível realizar o depósito');
            }
        } else {
            res.status(400).send('Email ou quantia de depósito não fornecidos');
        }
    };

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
        const pEmail = req.get('email');
        const pSaque = req.get('saque');

        if (pEmail && pSaque) {
            var saque = parseFloat(pSaque);
            const balance = await getWallet(pEmail);
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
            
            

            if (balance) {
                if (saque > balance) {
                    res.status(400).send('Saldo insuficiente para realizar o saque');
                }
            } else {
                res.status(400).send('Saldo não encontrado para o email: ' + pEmail);
            }

            if (saque > 101000) {
                res.status(400).send('Quantia de saque ecedeu o limite diário');
            };

            if (saque > 0 && await withdrawFunds(pEmail, saque)) {
                res.status(200).send(`Saque concluído com sucesso! Valor de saque R$${saque} Valor recebido: R$${saque - taxa} Taxa: R$${taxa}`);
            } else {
                res.status(400).send('Quantia de saque inválida ou email não encontrado');
            }
        }
        else {
            res.status(400).send('Email ou quantia de saque não fornecidos');
        }
    }
}
