import { CdkCustomResourceEvent } from 'aws-lambda';
import { Config } from '../../Config';

export async function handler(event: CdkCustomResourceEvent) {
  console.debug(JSON.stringify(event));
  if (event.RequestType == 'Create') {
    const config = new Config();
    const initial = event.ResourceProperties.initialConfig;
    const keys = Object.keys(initial);
    console.log('Changing config (creating keys)', keys);
    const promises = keys.map(key => config.set(key, initial[key]));
    await Promise.all(promises);
  } else if (event.RequestType == 'Update') {
    const policy: 'add'|'ignore' = event.ResourceProperties.updatePolicy;
    if (policy == 'ignore') {
      console.log('Update policy is ignore, exiting');
      return;
    }
    const config = new Config();
    const initial = event.ResourceProperties.initialConfig;
    const keys = Object.keys(initial);
    console.log(`Changing config (updating keys with policy ${event.ResourceProperties.updatePolicy})`, keys);

    if (policy == 'add') {
      await config.addKeys(initial);
    } else {
      console.warn('no policy selected, ignoring');
    }

  } else if (event.RequestType == 'Delete') {
    console.warn('Delete requested, no action. Backing table will be deleted');
    // do nothing. Table will be deleted anyway?
  }
}
