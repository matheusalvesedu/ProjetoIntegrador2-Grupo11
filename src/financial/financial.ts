import { Request, RequestHandler, Response } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv';

dotenv.config();

export namespace FinancialManager {

    let walletDatabase: Wallet[] = [];

    export type Wallet = {
        ownerEmail: string;
        balance: number;
    }

    export type Deposit = {
        walletOwnerEmail: string;
        value: number;
    }

    export type InternalWithdraw = {
        walletEmailFrom: string;
        walletEmailTo: string;
        value: number;
    }

    export type ExternallWithdraw = {
        walletEmailRequester: string;
        value: number;
    }

    // Função para obter o saldo de uma carteira
    export async function getWallet(ownerEmail: string): Promise<number | undefined> {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        const connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        // Executar a consulta no banco de dados
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
        const pEmail = req.get('email');

        if(pEmail){ 
            const balance = await getWallet(pEmail);
            if(balance){
                res.statusCode = 200;
                res.send(`Saldo da carteira encontrado: R$${balance}`);
            }else{
                res.statusCode = 400;
                res.send(`Carteira não encontrada para o email: ${pEmail}`);
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
        const pFunds= req.get('funds');

        

        if (pEmail && pFunds) {
            const funds = parseFloat(pFunds);
            
            if (funds > 0 && await addFunds(pEmail, funds)) {
                res.status(200).send(`Depósito concluído com sucesso!`);
            } else {
                res.status(400).send('Quantia de depósito inválida ou email não encontrado');
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
        const pSaque= req.get('saque');

        if (pEmail && pSaque) {
            var saque = parseFloat(pSaque);
            const balance = await getWallet(pEmail);

            if (balance){
                if (saque > balance){
                    res.status(400).send('Saldo insuficiente para realizar o saque');
                }
            }
            
            // criar saque diário total
            if (saque > 101000) {
                res.status(400).send('Quantia de saque ecedeu o limite diário');
            };

            

            if (saque > 0 && await withdrawFunds(pEmail, saque)) {
                res.status(200).send(`Saque concluído com sucesso!`);
                } else {
                res.status(400).send('Quantia de saque inválida ou email não encontrado');
                }
        } 
        else {
            res.status(400).send('Email ou quantia de saque não fornecidos');
        }
    }
}
