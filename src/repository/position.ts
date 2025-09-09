import * as xiao from '../garage/xiao';
// import { Pool } from '../database/postgresql';
import { IPosition } from '../model/position';
import { getPool } from '../database/postgresql';


class Position extends xiao.Xiao<IPosition> {
    protected tableName = 'positions';

    constructor(pool: xiao.XiaoPool) {
        super(pool);
    }
}

let singleton: Position | null = null;

export async function positionRepository(): Promise<Position> {
  if (!singleton) {
    const pool = await getPool();   // ensures pool is ready
    singleton = new Position(pool);
  }
  return singleton;
}