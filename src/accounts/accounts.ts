import { Request, RequestHandler, Response } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();

/*
    Namespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsHandler {
    
    /**
     * Tipo UserAccount
     */
    export type UserAccount = {
        id: number | undefined;
        completeName: string;
        email: string;
        password: string | undefined;
    };

    // Função para validar credenciais
    async function validateCredentials(email: string, password: string): Promise<boolean> {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        // Conectar-se ao Oracle
        const connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        // Executar a consulta para verificar se o e-mail e a senha existem
        const result = await connection.execute(
            'SELECT COUNT(*) AS COUNT FROM ACCOUNTS WHERE email = :email AND password = :password',
            [email, password]
        );

        await connection.close();

        // Verificar se result.rows existe e se o COUNT é maior que 0
        const rows = result.rows as { COUNT: number }[];
        return (rows && rows.length > 0 && rows[0].COUNT > 0) || false;
    }

    async function login(email: string, password: string) {
        const isValid = await validateCredentials(email, password);
        return isValid;
    }

    export const loginHandler: RequestHandler = 
        async (req: Request, res: Response) => {
            const pEmail = req.get('email'); // Mudado para req.body
            const pPassword = req.get('password'); // Mudado para req.body

            if (pEmail && pPassword) {
                // Chamar a função de login. 
                const isLoggedIn = await login(pEmail, pPassword);
                if (isLoggedIn) {
                    res.status(200).send('Login realizado com sucesso.');
                } else {
                    res.status(401).send('Credenciais inválidas. Acesso negado.');
                }
            } else {
                res.status(400).send('Requisição inválida - Parâmetros faltando.');
            }
        }
}
