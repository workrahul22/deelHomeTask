import { Op } from "sequelize";
import { Request } from "express";

async function getContractById(req: Request, id: number, profile: any) {
  const {Profile, Contract} = req.app.get('models');
    return await Contract.findOne({include: [{
        model: Profile,
        as: "Client"
      },
      {
        model: Profile,
        as: 'Contractor'
      }],
        where: {
            id, 
            [Op.or]: [
                { '$Contractor.id$': profile.id },
                { '$Client.id$': profile.id }
            ]
        }})
}

async function getContracts(req: Request, profile: any) {
  const {Profile, Contract} = req.app.get('models');
    return await Contract.findAll({include: [{
        model: Profile,
        as: "Client"
      },
      {
        model: Profile,
        as: 'Contractor'
      }],
        where: {
            [Op.or]: [
                { '$Contractor.id$': profile.id },
                { '$Client.id$': profile.id }
            ]
        }})
}

export {
    getContractById,
    getContracts
}