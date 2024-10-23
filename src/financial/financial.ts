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
    export async function getWallet(ownerEmail: string): Promise<number> {

        let balance: number = 0; 
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

        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as { balance: number };
            balance = row.balance;
        }

        return balance;
    }

    export const getWalletHandler: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');

        if(pEmail){ 
            const balance = getWallet(pEmail);
            if(balance){
                res.statusCode = 200;
                res.send(`Saldo da carteira: ${balance}`);
            }else{
                res.statusCode = 400;
                res.send(`Carteira não encontrada para o email: ${pEmail}`);
            }
        }
    }
}
