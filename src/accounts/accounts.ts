import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();
dotenv.config();
export namespace AccountsHandler {
    
    export type UserAccount = {
        id: number | undefined;
        completeName:string;
        email:string;
        password:string | undefined;
    };

    async function login(email: string, password: string) {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

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
                res.send('Login realizado com sucesso... confira...');
            } else {
                res.statusCode = 400;
                res.send('Requisição inválida - Parâmetros faltando.')
            }
        }



async function signUp(completeName: string, email: string, password: string) {

    OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

    let connection = await OracleDB.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONN_STR
    });

    const result = await connection.execute(
        `INSERT INTO ACCOUNTS (completeName, email, password) 
         VALUES (:completeName, :email, :password)`,
        [completeName, email, password],
        { autoCommit: true }
    );
    await connection.close();
    return result;
}

export const signUpHandler: RequestHandler =
    async (req: Request, res: Response) => {
        const pCompleteName = req.get('completeName');
        const pEmail = req.get('email');
        const pPassword = req.get('password');

        if (pCompleteName && pEmail && pPassword) {
            try {
                const result = await signUp(pCompleteName, pEmail, pPassword);

                if (result.rowsAffected && result.rowsAffected > 0) { 
                    res.status(201).send('Usuário cadastrado com sucesso.');
                } else {
                    res.status(500).send('Erro ao cadastrar o usuário.');
                }
            } catch (err) {
                console.error('Erro no cadastro: ', err);
                res.status(500).send('Erro interno do servidor.');
            }
        } else {
            res.status(400).send('Requisição inválida - Parâmetros faltando.');
        }
    }
}
