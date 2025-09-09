import * as xiao from '../garage/xiao';
// import { Pool } from '../database/postgresql';
import { ITransaction } from '../model/transaction';
import { getPool } from '../database/postgresql';


class Transaction extends xiao.Xiao<ITransaction> {
    protected tableName = 'transactions';

    constructor(pool: xiao.XiaoPool) {
        super(pool);
    }
}

let singleton: Transaction | null = null;

export async function txRepository(): Promise<Transaction> {
  if (!singleton) {
    const pool = await getPool();   // ensures pool is ready
    singleton = new Transaction(pool);
  }
  return singleton;
}