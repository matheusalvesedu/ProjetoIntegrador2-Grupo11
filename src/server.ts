import express from "express";
import { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { FinancialManager } from "./financial/financial";
import { EventsHandler } from "./events/events";

const port = 3001; 
const server = express();
const routes = Router();

// Middleware para analisar o corpo da requisição
server.use(express.json()); // Para lidar com JSON no corpo da requisição

// Definir as rotas
routes.get('/', (req: Request, res: Response) => {
    res.status(403).send('Acesso não permitido.');
});

// Rota para login
routes.post('/login', AccountsHandler.loginHandler);
routes.put('/signup', AccountsHandler.signUpHandler);
routes.get('/getWallet', FinancialManager.getWalletHandler);
routes.put('/addEvent', EventsHandler.addNewEventsHandler);
routes.post('/deleteEvent', EventsHandler.deleteEventHandler);
routes.post('/addFunds', FinancialManager.addFundsHandler);
routes.post('/withdrawFunds', FinancialManager.withdrawFundsHandler);
routes.post('/evaluateEvent', EventsHandler.evaluateEventHandler);
routes.get('/searchEvents', EventsHandler.searchEventsHandler);
routes.get('/getEvents', EventsHandler.getEventsHandler);
routes.put('/betOnEvent', EventsHandler.betOnEventsHandler);
routes.post('/finishEvent', EventsHandler.finishEventHandler);

server.use(routes);

// Iniciar o servidor
server.listen(port, () => {
    console.log(`Server is running on: ${port}`);
});
