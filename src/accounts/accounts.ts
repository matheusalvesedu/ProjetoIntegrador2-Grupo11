import { Request, RequestHandler, Response } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Namespace que contém tudo sobre "contas de usuários"
export namespace AccountsHandler {


    export type UserData ={
        id: number;
        email: string;
    };

    async function getUserIdByEmail(email: string): Promise<number | null> {
        let connection;
        try {
            connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR,
            });
    
            const result = await connection.execute(
                'SELECT ID FROM ACCOUNTS WHERE email = :email',
                [email]
            );
    
            if (result.rows && result.rows.length > 0) {
                const id = (result.rows[0] as {ID: number}).ID; // Uso do tipo UserData
                return id;
            } else {
                return null; // Email não encontrado
            }
        } catch (error) {
            console.error('Erro ao buscar ID do usuário:', error);
            return null; // Retornar null em caso de erro
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async function validateCredentials(email: string, password: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        const result = await connection.execute(
            'SELECT * FROM ACCOUNTS WHERE email = :email AND password = :password',
            [email, password]
        );

        await connection.close();

        return result.rows && result.rows.length > 0;
    }

    //criar uma funcao get_type_user(moderador ou player)
    

    async function login(email: string, password: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            'UPDATE ACCOUNTS SET token = dbms_random.string(\'X\', 10) WHERE email = :email AND password = :password',
            [email, password],
            { autoCommit: true }
        );

        return await validateCredentials(email, password);
    }

    export const loginHandler: RequestHandler =
        async (req: Request, res: Response) => {
            const pEmail = req.get('email');
            const pPassword = req.get('password');

            if (pEmail && pPassword) {
                const isLoggedIn = await login(pEmail, pPassword);
                if (isLoggedIn) {
                    if (!JWT_SECRET) {
                        res.status(500).json({ message: 'JWT secret is not defined in .env .' });
                        return;
                    }
                    const id = await getUserIdByEmail(pEmail);
                    const token = jwt.sign({ id: id, email: pEmail  }, JWT_SECRET, { expiresIn: '1h' });
                    

                    res.status(200).json({
                        message: 'Login realizado com sucesso.',
                        token: token,
                        id: id,
                    });
                } else {
                    res.status(401).json({ message: 'Credenciais inválidas. Acesso negado.' });
                }
            } else {
                res.status(400).json({ message: 'Requisição inválida - Parâmetros faltando.' });
            }
        }

    async function signUp(name: string, email: string, password: string, birthday_date: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        await connection.execute(
            'INSERT INTO ACCOUNTS (ID, complete_name, email, password, birthday_date, user_type, balance) VALUES (SEQ_ACCOUNTS.NEXTVAL, :complete_name, :email, :password, :birthday_date, :user_type, :balance)',
            [name, email, password, birthday_date, 'PLAYER', 0]
        );
        await connection.execute('commit');
        await connection.close();
    }

    export const signUpHandler: RequestHandler = async (req: Request, res: Response) => {
        const pName = req.get('complete_name');
        const pEmail = req.get('email');
        const pPassword = req.get('password');
        const pBirthday_date = req.get('birthday_date');

        if (pName && pEmail && pPassword && pBirthday_date) {
            let connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });

            // Verifica se a data de nascimento tem o formato correto
            const formato = /^\d{4}-\d{2}-\d{2}$/;
            if (!formato.test(pBirthday_date)) {
                res.status(400).json({ message: 'Formato da data de nascimento inválido. O formato correto é yyyy-mm-dd.' });
                await connection.close();
                return;
            }

            // Converte a data de nascimento para o formato Date
            const [year, month, day] = pBirthday_date.split('-').map(Number);
            const birthDate = new Date(year, month - 1, day);

            // Verifica se o usuário tem pelo menos 18 anos
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();
            const dayDifference = today.getDate() - birthDate.getDate();

            if (age < 18 || (age === 18 && (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))) {
                res.status(400).json({ message: 'Usuário deve ter pelo menos 18 anos.' });
                await connection.close();
                return;
            }
            const result = await connection.execute(
                'SELECT * FROM ACCOUNTS WHERE email = :email',
                [pEmail]
            );

            if (result.rows && result.rows.length > 0) {
                res.status(400).json({ message: 'Usuário já cadastrado.' });
            } else {
                await signUp(pName, pEmail, pPassword, pBirthday_date);
                res.status(200).json({ message: 'Usuário cadastrado com sucesso.' });
            }

            await connection.close();

        } else {
            res.status(400).json({ message: 'Requisição inválida - Parâmetros faltando.' });
        }
    };
}
