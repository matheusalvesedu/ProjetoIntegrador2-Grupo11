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


    async function signUp(name: string, email: string, password: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        const connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            'INSERT INTO ACCOUNTS (ID, completeName, email, password) VALUES (SEQ_ACCOUNTS.NEXTVAL, :name, :email, :password)',
            [name, email, password]
        );
        await connection.execute('commit');
        await connection.close();
    }

    // Handler para o cadastro de novos usuários
    export const signUpHandler: RequestHandler = async (req: Request, res: Response) => {
        const pName = req.get('name');  // Mudado para req.body para capturar os dados corretamente
        const pEmail = req.get('email');
        const pPassword = req.get('password');

        if (pName && pEmail && pPassword) {
            // Conexão com o banco de dados para verificar se o e-mail já existe
            const connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });

            const result = await connection.execute(
                'SELECT * FROM ACCOUNTS WHERE email = :email',
                [pEmail]
            );

            if (result.rows && result.rows.length > 0) {
                // Se o usuário já estiver cadastrado
                res.status(400).send('Usuário já cadastrado.');
            } else {
                // Se o usuário não estiver cadastrado, faz o cadastro
                await signUp(pName, pEmail, pPassword);
                res.status(200).send('Usuário cadastrado com sucesso.');
            }

            await connection.close();

        } else {
            // Verifica se algum parâmetro está faltando
            res.status(400).send('Requisição inválida - Parâmetros faltando.');
        }
    };
    }