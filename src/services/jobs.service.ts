import { Op } from "sequelize";
import { Profile, Job, Contract, sequelize } from "../model";

async function getUnpaidJobs(profile: any): Promise<Array<Job>> {
    const unPaidJobs = await Job.findAll({
        include: [
          {
            model: Contract,
            as: "Contract",
            include: [
              {
                model: Profile,
                as: 'Client'
              },
              {
                model: Profile,
                as: 'Contractor'
              }
            ]
          }
        ],
        where: {
          '$Contract.status$': "in_progress",
          [Op.and]: [
            {[Op.or]: [{paid: null}, {paid: false}]},
            { [Op.or]: [
                { '$Contract.Contractor.id$': profile.id },
                { '$Contract.Client.id$': profile.id }
              ]}
          ],
        }
      });
      return unPaidJobs
}


async function payForJobs(jobId: number, profile: any): Promise<any> {
    const transaction = await sequelize.transaction();
    console.log({jobId})
    try {
        const job = await Job.findOne({
            where: { id: jobId },
            include: [
              {
                model: Contract,
                as: 'Contract',
                include: [
                  {
                    model: Profile,
                    as: 'Contractor'
                  },
                  {
                    model: Profile,
                    as: 'Client',
                    where: { id: profile.id }
                  }
                ]
              }
            ],
            transaction
          }) as any;
      if (!job) {
        return {message: "Job Not Found"}
      }
      if(job.paid) {
        return {message: "Already Paid"};
      } 
      const amountToPay = job.price;
      const client = job.Contract.Client;
      const contractor = job.Contract.Contractor;
  
      if (client.balance < amountToPay) {
        return {message: "Insufficient Balance"};
      }
      await Profile.update(
        { balance: client.balance - amountToPay },
        { where: { id: client.id }, transaction }
      );
  
      await Profile.update(
        { balance: contractor.balance + amountToPay },
        { where: { id: contractor.id }, transaction }
      );
  
      await Job.update({ paid: true,  paymentDate: new Date()}, { where: { id: jobId }, transaction });
      await transaction.commit();
      const clientProfile = await Profile.findOne({where: {id: client.id}});
      const contractorProfile = await Profile.findOne({where: {id: contractor.id}});
      return { message: 'Payment successful', amount: amountToPay, clientProfile, contractorProfile };
    } catch (error) {
        console.log(error);
      await transaction.rollback();
      throw error;
    }
}

export {
    getUnpaidJobs,
    payForJobs
}