import express, { Request, Response, Router, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AccountsHandler } from "./accounts/accounts";
import { FinancialManager } from "./financial/financial";
import { EventsHandler } from "./events/events";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Extensão da interface Request para incluir `user`
declare global {
    namespace Express {
        interface Request {
            user?: { id: number; email: string };
        }
    }
}

// Middleware de autenticação
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1]; // Ex: "Bearer <token>"
    if (!token) {
        res.status(401).json({ message: 'Token não fornecido.' });
        return;
    }

    if (!JWT_SECRET) {
        res.status(500).json({ message: 'JWT secret não configurado no servidor.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
        req.user = decoded; // Adicionar informações do usuário no request
        next();

    } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};


const port = 3001;
const server = express();
const routes = Router();

// Middlewares globais
server.use(cors());
server.use(express.json()); // Middleware para analisar JSON no corpo da requisição

// Rotas protegidas (exemplo)
routes.get('/getWallet', authMiddleware, FinancialManager.getWalletHandler);
routes.put('/addEvent', authMiddleware, EventsHandler.addNewEventsHandler);
routes.post('/deleteEvent', authMiddleware, EventsHandler.deleteEventHandler);
routes.post('/addFunds', authMiddleware, FinancialManager.addFundsHandler);
routes.post('/withdrawFunds', authMiddleware, FinancialManager.withdrawFundsHandler);
routes.post('/evaluateEvent', authMiddleware, EventsHandler.evaluateEventHandler);
routes.get('/searchEvents', authMiddleware, EventsHandler.searchEventsHandler);
routes.get('/getEvents', authMiddleware, EventsHandler.getEventsHandler);
routes.put('/betOnEvent', authMiddleware, EventsHandler.betOnEventsHandler);
routes.post('/finishEvent', authMiddleware, EventsHandler.finishEventHandler);

// Rotas públicas específicas
routes.post('/login', AccountsHandler.loginHandler);
routes.put('/signup', AccountsHandler.signUpHandler);

// Adicionando rotas ao servidor
server.use(routes);

// Iniciar o servidor
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
