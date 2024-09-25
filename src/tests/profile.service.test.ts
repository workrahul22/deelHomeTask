import { getMaxDepositAmount } from '../services/profile.service';

describe('getMaxDepositAmount', () => {
  test('should return 25% of total unpaid amount', () => {
    const totalUnpaidAmount = 1000;
    const expectedMaxDeposit = 250;
    const result = getMaxDepositAmount(totalUnpaidAmount);
    
    expect(result).toBe(expectedMaxDeposit);
  });

  test('should return 0 if total unpaid amount is 0', () => {
    const totalUnpaidAmount = 0;
    const expectedMaxDeposit = 0;
    const result = getMaxDepositAmount(totalUnpaidAmount);
    
    expect(result).toBe(expectedMaxDeposit);
  });

  test('should handle negative values gracefully', () => {
    const totalUnpaidAmount = -1000;
    const expectedMaxDeposit = -250;
    const result = getMaxDepositAmount(totalUnpaidAmount);
    
    expect(result).toBe(expectedMaxDeposit);
  });

  test('should handle floating point amounts', () => {
    const totalUnpaidAmount = 1234.56;
    const expectedMaxDeposit = 1234.56 * 0.25;
    const result = getMaxDepositAmount(totalUnpaidAmount);
    
    expect(result).toBeCloseTo(expectedMaxDeposit, 2); // rounding to 2 decimal places
  });
});