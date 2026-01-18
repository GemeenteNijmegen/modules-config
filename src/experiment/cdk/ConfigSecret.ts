import { Secret, SecretProps } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class ConfigSecret {

  constructor(
    readonly name: string,
    readonly description: string,
    readonly secretProps: SecretProps = {},
  ) { }

  createSecret(scope: Construct) {
    return new Secret(scope, this.name, {
      ...this.secretProps,
      description: `${this.secretProps.description ?? this.description} (Managed by Gemeente Nijmegen Config package)`
    });
  }

}