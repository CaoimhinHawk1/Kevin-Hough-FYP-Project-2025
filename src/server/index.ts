import express, {Request, Response} from 'express';

const app = express();
app.get('/api/hi', (req:Request ,res:Response)=>{
  res.send('Hello')
  });
app.listen(3002, () => console.log('Started :)'))
