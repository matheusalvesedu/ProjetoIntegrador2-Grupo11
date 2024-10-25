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
    async function getWallet(ownerEmail: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        // Executar a consulta no banco de dados
        const result = await connection.execute(
            'SELECT balance FROM accounts WHERE email = :ownerEmail',
            [ownerEmail]
        );
        
        await connection.close();
        console.log(result.rows);
        // Retorna o saldo da carteira se houver registros  
        return result.rows && result.rows.length > 0 ? result.rows[0] : false;
        
    }

    export const getWalletHandler: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');

        if (pEmail) { 
            const balance = await getWallet(pEmail);
            if (balance !== false) {
                console.log(balance);
                res.status(200).send(`Saldo da carteira encontrado: ${balance}`);
            } else {
                res.status(400).send(`Carteira não encontrada para o email: ${pEmail}`);
            }
        } else {
            res.status(400).send('Email não fornecido');
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


// /withdrawFunds (“Sacar fundos” - Uma vez que um apostador creditou algum valor ou
//     tem fundos na carteira, recebeu prêmios ou quer simplesmente “sacar” o que tem em carteira,
//     esse valor deverá ser transferido para a conta corrente informada).

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
            if (saque > 5000 && saque <= 100000) {
                saque = saque - saque * 0.01;
            };
            if (saque > 1000 && saque <= 5000) {
                saque = saque - saque * 0.02;
            };
            if (saque > 100 && saque <= 1000) {
                saque = saque - saque * 0.03;
            };
            if (saque > 0 && saque <= 100) {
                saque = saque - saque * 0.04;
            };
            if (saque > 0 && await withdrawFunds(pEmail, saque)) {
                if (saque > 101000) {
                    res.status(400).send('Quantia de saque ecedeu o limite diário');
                };
            res.status(200).send(`Saque concluído com sucesso!`);
            } else {
            res.status(400).send('Quantia de saque inválida ou email não encontrado');
            }
        } else {
            res.status(400).send('Email ou quantia de saque não fornecidos');
        }
    }
}
