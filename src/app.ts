import { Request, Response} from 'express';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { sequelize } from './model';
import { getProfile } from './middleware/getProfile';
import * as swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './swagger.json';
import { getContractById, getContracts } from './services/contract.service';
import { getUnpaidJobs, payForJobs } from './services/jobs.service';
import { getBestProfession, getBestClients } from './services/admin.service';
import { depositAmount } from './services/profile.service';

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api-docs.json", (req: Request, res: Response) => res.json(swaggerDocument))

app.get('/contracts/:id', getProfile ,async (req: Request, res: Response) =>{
    const {id} = req.params
    const profile = req.profile;
    try {
        const contract = await getContractById(req, +id, profile);
        res.json(contract);
    } catch(error) {
        console.log(error);
        res.json({message: "Something Went Wrong Please try after sometime"});
    }
})

app.get('/contracts', getProfile, async(req: Request, res: Response) => {
    const profile = req.profile;
    const contracts = await getContracts(req, profile);
    res.json(contracts);
})

app.get('/jobs/unpaid', getProfile, async(req: Request, res: Response) => {
    const profile = req.profile;
    const unpaidJobs = await getUnpaidJobs(profile);
    res.json(unpaidJobs);
})

app.post('/jobs/:jobId/pay', getProfile, async(req: Request, res: Response) => {
    const {jobId} = req.params
    const profile = req.profile;
    const result = await payForJobs(+jobId, profile)
    return res.json(result);
})

app.post('/balances/deposit/:userId', getProfile, async(req: Request, res: Response) => {
    const profile = req.profile;
    const amount = +req.body["depositAmount"];
    if(Number.isNaN(amount)) {
        res.json({message: "Send a valid deposit amount"});
        return;
    }
    const result = await depositAmount(profile, +amount);
    res.json(result);
})

app.get('/admin/best-profession', getProfile, async(req: Request, res: Response) => {
    const start = new Date(req.query['start'] as any).toISOString();
    const end = new Date(req.query['end'] as any).toISOString();
    const bestProfession = await getBestProfession(start, end);
    if (bestProfession.length === 0) {
        return res.json({ message: 'No jobs found for the specified date range.' });
      }
  
      return res.json(bestProfession[0]);
})

app.get('/admin/best-clients', async(req: Request, res: Response) => {
    const start = new Date(req.query['start'] as any).toISOString();
    const end = new Date(req.query['end'] as any).toISOString();
    const limit = req.query['limit'] || 2;
    const bestClients = await getBestClients(+limit, start, end);
    if (bestClients.length === 0) {
        return res.json({ message: 'No clients found for the specified date range.' });
      }
  
      return res.json(bestClients);
})

export = app;
