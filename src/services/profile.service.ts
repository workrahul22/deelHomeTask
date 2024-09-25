import {Op} from 'sequelize';
import {Profile, sequelize, Contract, Job} from '../model';

async function depositAmount(profile: any, depositAmount: number): Promise<any> {
    const transaction = await sequelize.transaction();
    try {
        const totalUnpaidAmount = await Job.sum('price', {
            include: [{
              model: Contract,
              as: 'Contract',
              where: {
                ClientId: profile.id
              }
            }],
            where: {
              [Op.or]: [
                { paid: { [Op.ne]: true } },
                { paid: { [Op.is]: null } } 
              ]
            },
            transaction: transaction
          } as any);
  
      const maxDeposit = getMaxDepositAmount(totalUnpaidAmount);

      if (depositAmount > maxDeposit) {
        return  {message: `Deposit exceeds maximum allowed limit of ${maxDeposit}`};
      }

      const client = await Profile.findOne({ where: { id: profile.id }, transaction }) as any;
  
      if (!client) {
        return  {message: `Client not found`};
      }
      await Profile.update(
        { balance: client.balance + depositAmount },
        { where: { id: profile.id }, transaction }
      );
      await transaction.commit();
      const updatedClientProfile = await await Profile.findOne({ where: { id: profile.id } });
      return { message: 'Deposit successful', newBalance: client.balance + depositAmount, updatedClientProfile };
    } catch (error) {
      await transaction.rollback();
      return {message: "Something went wrong please try again"}
    }
}

function getMaxDepositAmount(totalUnpaidAmount: number) {
  return totalUnpaidAmount * 0.25;
}

export {
    depositAmount,
    getMaxDepositAmount
}