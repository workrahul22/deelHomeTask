import { Op } from 'sequelize';
import {sequelize, Profile, Contract, Job} from '../model';

async function getBestProfession(startDate: string, endDate: string) {
  console.log({startDate, endDate});
    const result = await Job.findAll({
        attributes: [
          [sequelize.col('Contract.Contractor.profession'), 'profession'], 
          [sequelize.fn('SUM', sequelize.col('price')), 'totalEarnings'] 
        ],
        include: [
          {
            model: Contract,
            as: 'Contract',
            include: [
              {
                model: Profile,
                as: 'Contractor',  
                attributes: []
              }
            ]
          }
        ],
        where: {
          paid: true,
          updatedAt: { 
            [Op.between]: [startDate, endDate]
          }
        },
        group: ['Contract.Contractor.profession'],  
        order: [[sequelize.fn('SUM', sequelize.col('price')), 'DESC']],
        limit: 1
      });
      return result;
}

async function getBestClients(limit: number, startDate: Date, endDate: Date): Promise<any> {
    const result = await Job.findAll({
        attributes: [
          [sequelize.col('Contract.Client.id'), 'ClientId'],
          [sequelize.col('Contract.Client.firstName'), 'ClientName'], 
          [sequelize.fn('SUM', sequelize.col('price')), 'totalPaid']
        ],
        include: [
          {
            model: Contract,
            as: 'Contract',
            include: [
              {
                model: Profile,
                as: 'Client',
                attributes: []
              }
            ]
          }
        ],
        where: {
          paid: true,
          updatedAt: { 
            [Op.between]: [startDate, endDate]
          }
        },
        group: ['Contract.Client.id', 'Contract.Client.firstName'],
        order: [[sequelize.fn('SUM', sequelize.col('price')), 'DESC']],
        limit
      });
      return result;
}

export {
    getBestProfession,
    getBestClients
}