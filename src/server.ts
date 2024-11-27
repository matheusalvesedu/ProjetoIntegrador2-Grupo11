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
            user?: { id: number; email: string, typeUser: string };
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
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string , typeUser: string};
        req.user = decoded; 
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
routes.get('/getTransactions', authMiddleware, FinancialManager.getTransactionsHandler);
routes.get('/getBets', authMiddleware, EventsHandler.getBetsHandler);
routes.get('/getWallet', authMiddleware, FinancialManager.getWalletHandler);
routes.put('/addEvent', authMiddleware, EventsHandler.addNewEventsHandler);
routes.post('/deleteEvent', EventsHandler.deleteEventHandler);
routes.post('/addFunds', authMiddleware, FinancialManager.addFundsHandler);
routes.post('/withdrawFunds', authMiddleware, FinancialManager.withdrawFundsHandler);
routes.post('/evaluateEvent', EventsHandler.evaluateEventHandler);
routes.get('/searchEvents', authMiddleware, EventsHandler.searchEventsHandler);
routes.get('/getEvents',  EventsHandler.getEventsHandler);
routes.put('/betOnEvent', authMiddleware, EventsHandler.betOnEventsHandler);
routes.post('/finishEvent', EventsHandler.finishEventHandler);
routes.get("/getEventsBets", EventsHandler.getEventsByTotalBetsHandler);

// Rotas públicas específicas
routes.post('/login', AccountsHandler.loginHandler);
routes.put('/signup', AccountsHandler.signUpHandler);

// Adicionando rotas ao servidor
server.use(routes);

// Iniciar o servidor
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
