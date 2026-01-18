import { CdkCustomResourceEvent } from 'aws-lambda';
import { Config } from '../Config';

export async function handler(event: CdkCustomResourceEvent) {

  console.debug('event:', JSON.stringify(event));

  if (event.RequestType == 'Create' || event.RequestType == 'Update') {

    const config = new Config();
    const baseConfig = event.ResourceProperties.baseConfig;
    await config.store(baseConfig);

  } else if (event.RequestType == 'Delete') {
    console.warn('Delete requested, no action. Backing table will be deleted');
    // do nothing. Table will be deleted anyway
  }

}
