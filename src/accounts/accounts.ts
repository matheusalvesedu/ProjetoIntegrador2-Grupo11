import { Request, RequestHandler, Response } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv';
dotenv.config();


// Namespace que contém tudo sobre "contas de usuários"
export namespace AccountsHandler {

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
                    res.status(200).send('Login realizado com sucesso.');
                } else {
                    res.status(401).send('Credenciais inválidas. Acesso negado.');
                }
            } else {
                res.status(400).send('Requisição inválida - Parâmetros faltando.');
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
                res.status(400).send('Formato da data de nascimento inválido. O formato correto é yyyy-mm-dd.');
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
                res.status(400).send('Usuário deve ter pelo menos 18 anos.');
                await connection.close();
                return;
            }
            const result = await connection.execute(
                'SELECT * FROM ACCOUNTS WHERE email = :email',
                [pEmail]
            );

            if (result.rows && result.rows.length > 0) {

                res.status(400).send('Usuário já cadastrado.');
            } else {

                await signUp(pName, pEmail, pPassword, pBirthday_date);
                res.status(200).send('Usuário cadastrado com sucesso.');
            }

            await connection.close();

        } else {
            res.status(400).send('Requisição inválida - Parâmetros faltando.');
        }
    };
}
