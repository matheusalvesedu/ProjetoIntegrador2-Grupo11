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
    async function validateCredentials(email: string, password: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        // Conectar-se ao Oracle
        const connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        // Executar a consulta para verificar se o e-mail e a senha existem
        const result = await connection.execute(
            'SELECT * FROM ACCOUNTS WHERE email = :email AND password = :password',
            [email, password]
        );

        await connection.close();

        // Retorna verdadeiro se existirem registros
        return result.rows && result.rows.length > 0; // Retorna true se houver pelo menos uma linha
    }

    async function login(email: string, password: string) {
        return await validateCredentials(email, password); // Retorna diretamente o resultado da validação
    }

    export const loginHandler: RequestHandler = 
        async (req: Request, res: Response) => {
            const pEmail = req.get('email'); 
            const pPassword = req.get('password'); 

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
