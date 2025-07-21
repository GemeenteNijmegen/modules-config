import { Config } from '../../src/Config';

export async function handler(event: any) {
  const config = new Config();
  console.log(await config.get('secret'));
}
