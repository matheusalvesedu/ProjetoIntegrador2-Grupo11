import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();

/*
    Nampespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsHandler {
    
    /**
     * Tipo UserAccount
     */
    export type UserAccount = {
        id: number | undefined;
        completeName:string;
        email:string;
        password:string | undefined;
    };

    async function login(email: string, password: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        // passo 1 - conectar-se ao oracle. 
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let accouts = await connection.execute(
            'SELECT * FROM ACCOUNTS WHERE email = :email AND password = :password',
            [email, password]
        );

        await connection.close();

        console.log(accouts.rows)
    }

    export const loginHandler: RequestHandler = 
        async (req: Request, res: Response) => {
            const pEmail = req.get('email');
            const pPassword = req.get('password');
            if(pEmail && pPassword){
                // chamar a funcao de login. 
                await login(pEmail, pPassword);
                res.statusCode = 200;
                res.send('Login realizado... confira...');
            } else {
                res.statusCode = 400;
                res.send('Requisição inválida - Parâmetros faltando.')
            }
        }
}