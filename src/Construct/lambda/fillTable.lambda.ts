import { CdkCustomResourceEvent } from 'aws-lambda';
import { Config } from '../../Config';

export async function handler(event: CdkCustomResourceEvent) {
  console.debug(JSON.stringify(event));
  if (event.RequestType == 'Create' || event.RequestType == 'Update') {
    const config = new Config();
    const initial = event.ResourceProperties.initialConfig;
    const keys = Object.keys(initial);
    console.log('Changing config (creating / updating keys)', keys);
    const promises = keys.map(key => config.set(key, initial[key]));
    await Promise.all(promises);
  } else if (event.RequestType == 'Delete') {
    console.warn('Delete requested, no action. Backing table will be deleted');
    // do nothing. Table will be deleted anyway?
  }
}
