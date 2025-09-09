import * as xiao from '../garage/xiao';
// import { Pool } from '../database/postgresql';
import { IUser } from '../model/user';
import { getPool } from '../database/postgresql';


class User extends xiao.Xiao<IUser> {
    protected tableName = 'users';

    constructor(pool: xiao.XiaoPool) {
        super(pool);
    }
}

let singleton: User | null = null;

export async function userRepository(): Promise<User> {
  if (!singleton) {
    const pool = await getPool();   // ensures pool is ready
    singleton = new User(pool);
  }
  return singleton;
}