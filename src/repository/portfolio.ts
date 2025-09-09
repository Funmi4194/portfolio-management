import * as xiao from '../garage/xiao';
// import { Pool } from '../database/postgresql';
import { IPortfolio } from '../model/potfolio';
import { getPool } from '../database/postgresql';


class Potfolio extends xiao.Xiao<IPortfolio> {
    protected tableName = 'users';

    constructor(pool: xiao.XiaoPool) {
        super(pool);
    }
}

let singleton: Potfolio | null = null;

export async function txRepository(): Promise<Potfolio> {
  if (!singleton) {
    const pool = await getPool();   // ensures pool is ready
    singleton = new Potfolio(pool);
  }
  return singleton;
}