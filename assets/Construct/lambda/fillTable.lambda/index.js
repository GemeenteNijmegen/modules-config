"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@gemeentenijmegen/utils/lib/AWS.js
var require_AWS = __commonJS({
  "node_modules/@gemeentenijmegen/utils/lib/AWS.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AWS = void 0;
    var client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
    var client_ssm_1 = require("@aws-sdk/client-ssm");
    var AWS2 = class {
      /**
       * Retrieves a secret from the secrets store given an ARN
       * Note: only string secrets are supported (binary values are ignored).
       * @param arn
       * @returns the secret as a string
       */
      static async getSecret(arn) {
        const secretsManagerClient = new client_secrets_manager_1.SecretsManagerClient({});
        const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: arn });
        const data = await secretsManagerClient.send(command);
        if (data?.SecretString) {
          return data.SecretString;
        }
        throw new Error("No secret value found");
      }
      /**
       * Get a parameter from parameter store.
       * @param {string} name Name of the ssm param
       * @returns param value
       */
      static async getParameter(name) {
        const client = new client_ssm_1.SSMClient({});
        const command = new client_ssm_1.GetParameterCommand({ Name: name });
        const data = await client.send(command);
        if (data.Parameter?.Value) {
          return data.Parameter?.Value;
        }
        throw new Error("No parameter value found");
      }
    };
    exports2.AWS = AWS2;
  }
});

// node_modules/@gemeentenijmegen/utils/lib/environmentVariables.js
var require_environmentVariables = __commonJS({
  "node_modules/@gemeentenijmegen/utils/lib/environmentVariables.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.environmentVariables = void 0;
    function environmentVariables(keys, defaults = {}) {
      const env = {};
      keys.forEach((key) => {
        const typedKey = key;
        const value = process.env[typedKey] ?? defaults[typedKey] ?? "";
        if (!value) {
          throw new Error(`Environment variable ${typedKey} is missing`);
        }
        env[typedKey] = value;
      });
      return env;
    }
    exports2.environmentVariables = environmentVariables;
  }
});

// node_modules/@gemeentenijmegen/utils/lib/authenticate.js
var require_authenticate = __commonJS({
  "node_modules/@gemeentenijmegen/utils/lib/authenticate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.authenticate = void 0;
    var AWS_1 = require_AWS();
    var environmentVariables_1 = require_environmentVariables();
    var ALLOWED_HEADERS = [
      "X-Authorization",
      "Authorization",
      "authorization",
      "x-api-key"
    ];
    var API_KEY = void 0;
    async function authenticate(event) {
      if (!API_KEY) {
        const env = (0, environmentVariables_1.environmentVariables)(["API_KEY_ARN"]);
        API_KEY = await AWS_1.AWS.getSecret(env.API_KEY_ARN);
      }
      if (!API_KEY) {
        throw new Error("API_KEY was not loaded, is API_KEY_ARN env variable set?");
      }
      if (!event.headers) {
        throw new Error("No headers avaialble to check for API key");
      }
      const usedHeader = ALLOWED_HEADERS.find((h) => event.headers[h] != void 0);
      if (!usedHeader) {
        throw new Error("No headers available to check for API key");
      }
      const header = event.headers[usedHeader];
      if (!header) {
        throw new Error("No Authorization header found in the request.");
      }
      if (!header.startsWith("Token ")) {
        throw new Error("Authorization header must have a token prefix");
      }
      if (header.substring("Token ".length) === API_KEY) {
        return true;
      }
      throw new Error("Invalid API Key");
    }
    exports2.authenticate = authenticate;
  }
});

// node_modules/@gemeentenijmegen/utils/lib/Bsn.js
var require_Bsn = __commonJS({
  "node_modules/@gemeentenijmegen/utils/lib/Bsn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Bsn = void 0;
    var Bsn = class _Bsn {
      /**
       * Check if the provided value can be considered a (formally) valid BSN. No checks
       * are done to check if the BSN is actually in use.
       * This is described in https://www.rvig.nl/bsn/documenten/publicaties/2022/01/02/logisch-ontwerp-bsn-1.6
       */
      static validate(bsn) {
        if (!Number.isInteger(parseInt(bsn))) {
          return {
            success: false,
            message: "provided BSN is not a number"
          };
        }
        if (bsn.length < 8 || bsn.length > 9) {
          return {
            success: false,
            message: `provided BSN is of incorrect length, provided length is ${bsn.length}`
          };
        }
        if (!_Bsn.elfproef(bsn)) {
          return {
            success: false,
            message: "provided BSN does not satisfy elfproef"
          };
        }
        return {
          success: true
        };
      }
      /**
       * All Dutch BSN's must conform to the 'elfproef'
       *
       * @param {string} bsn
       * @returns boolean true if value succeeds the elfproef
       */
      static elfproef(bsn) {
        const digits = bsn.split("");
        if (digits.length == 8) {
          digits.unshift("0");
        }
        let total = 0;
        digits.forEach((digitChar, i) => {
          const digit = parseInt(digitChar);
          if (i == digits.length - 1) {
            total += digit * -1;
          } else {
            total += digit * (digits.length - i);
          }
        });
        return total % 11 == 0;
      }
      /**
       * Utility class for using dutch BSN's
       *
       * Providing an invalid BSN to the class constructor
       * will throw an error.
       *
       * @param {string} bsn
       */
      constructor(bsn) {
        this.bsn = bsn;
        this.validate();
      }
      /** Validates the BSN. Called by the constructor.
       * @deprecated for direct use, call the static validate method `Bsn.validate(bsn: string)`, which
       * provides an error message and status, instead of throwing.
       */
      validate() {
        const result = _Bsn.validate(this.bsn);
        if (result.success) {
          return;
        } else {
          throw Error(result.message);
        }
      }
      elfproef() {
        _Bsn.elfproef(this.bsn);
      }
    };
    exports2.Bsn = Bsn;
  }
});

// node_modules/@gemeentenijmegen/utils/lib/Storage.js
var require_Storage = __commonJS({
  "node_modules/@gemeentenijmegen/utils/lib/Storage.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.S3Storage = void 0;
    var client_s3_1 = require("@aws-sdk/client-s3");
    var s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
    var S3Storage = class {
      constructor(bucket, config) {
        this.clients = {
          default: new client_s3_1.S3Client({})
        };
        this.bucket = bucket;
        this.s3Client = config?.client ?? new client_s3_1.S3Client({});
      }
      async store(key, contents) {
        console.debug(`Storing ${key} with contents of size ${contents.length} to ${this.bucket}`);
        const command = new client_s3_1.PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: contents,
          ServerSideEncryption: "aws:kms"
        });
        try {
          await this.s3Client.send(command);
          console.debug(`successfully stored ${key}`);
        } catch (err) {
          console.error(err);
          return false;
        }
        return true;
      }
      async get(key) {
        const command = new client_s3_1.GetObjectCommand({
          Bucket: this.bucket,
          Key: key
        });
        try {
          const bucketObject = await this.s3Client.send(command);
          return bucketObject;
        } catch (err) {
          console.error(`getBucketObject failed for key ${key} with error: `, err);
          return void 0;
        }
      }
      async getBatch(keys) {
        const promises = keys.map((key) => this.get(key));
        const results = await Promise.allSettled(promises);
        const bucketObjects = results.filter((result, index) => {
          if (result.status == "rejected") {
            console.log(`object ${keys[index]} in batch failed: ${result.reason}`);
          }
          return result.status == "fulfilled" && result.value;
        });
        return bucketObjects.map((bucketObject) => bucketObject.value);
      }
      /**
       * Copy an S3 object between buckets.
       *
       * If both buckets are in the same region, this will use the CopyObject command.
       * **NB**: This requires s3:getObjectTagging permissions on the source object.
       */
      async copy(sourceBucket, sourceKey, sourceRegion, destinationKey) {
        const currentRegion = this.clients.default.region ?? process.env.AWS_REGION;
        if (currentRegion == sourceRegion) {
          console.debug("Source and destination in same region, use more effici\xEBnt copy command");
          try {
            return await this.copyInSameRegion(sourceBucket, sourceKey, destinationKey);
          } catch (error) {
            console.warn("Efficient Copy command failed. Do you have s3:getObjectTagging permissions set for the source bucket? Falling back to old style copy.");
          }
        }
        await this.copyByGetAndPutObject(sourceBucket, sourceKey, sourceRegion, destinationKey);
        console.debug(`successfully copied ${sourceBucket}/${sourceKey} to ${destinationKey}`);
        return true;
      }
      async copyByGetAndPutObject(sourceBucket, sourceKey, sourceRegion, destinationKey) {
        const getObjectCommand = new client_s3_1.GetObjectCommand({
          Bucket: sourceBucket,
          Key: sourceKey
        });
        try {
          const object = await this.clientForRegion(sourceRegion).send(getObjectCommand);
          const putObjectCommand = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: destinationKey,
            Body: object.Body,
            // Request needs to know length to accept a stream: https://github.com/aws/aws-sdk-js/issues/2961#issuecomment-1580901710
            ContentLength: object.ContentLength
          });
          await this.clients.default.send(putObjectCommand);
        } catch (err) {
          console.error(err);
        }
      }
      async copyInSameRegion(sourceBucket, sourceKey, destinationKey) {
        console.debug(`syncing ${sourceBucket}/${sourceKey} to ${destinationKey}`);
        const command = new client_s3_1.CopyObjectCommand({
          CopySource: encodeURI(`${sourceBucket}/${sourceKey}`),
          Bucket: this.bucket,
          Key: destinationKey
        });
        try {
          await this.s3Client.send(command);
          console.debug(`successfully copied ${sourceBucket}/${sourceKey} to ${destinationKey}`);
        } catch (err) {
          console.error(`Failed to copy object: ${sourceBucket}/${sourceKey} ${err}`);
          throw err;
        }
        return true;
      }
      async searchAllObjectsByShortKey(searchKey) {
        console.info(`start searching all objects with listV2Object with searchkey ${searchKey}`);
        const allKeys = [];
        const command = new client_s3_1.ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: searchKey
        });
        let isTruncated = true;
        while (isTruncated) {
          console.log("In while isTruncated loop");
          const listObjectsV2Output = await this.s3Client.send(command);
          listObjectsV2Output.Contents?.filter((contents) => contents.Key?.includes("submission.json")).map((contents) => {
            contents.Key ? allKeys.push(contents?.Key) : console.log("[searchAllObjectsByShortKey] Individual key not found and not added to allKeys.");
          });
          isTruncated = !!listObjectsV2Output.IsTruncated;
          command.input.ContinuationToken = listObjectsV2Output.NextContinuationToken;
        }
        console.info(`[searchAllObjectsByShortKey] Found ${allKeys.length} bucket objects with prefix ${searchKey}`);
        return allKeys;
      }
      getPresignedUrl(key, expiresIn) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: key });
        return (0, s3_request_presigner_1.getSignedUrl)(this.clients.default, command, { expiresIn: expiresIn ?? 5 });
      }
      clientForRegion(region) {
        if (!this.clients[region]) {
          this.clients[region] = new client_s3_1.S3Client({ region });
        }
        return this.clients[region];
      }
    };
    exports2.S3Storage = S3Storage;
  }
});

// node_modules/@gemeentenijmegen/utils/lib/index.js
var require_lib = __commonJS({
  "node_modules/@gemeentenijmegen/utils/lib/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.S3Storage = exports2.environmentVariables = exports2.Bsn = exports2.AWS = exports2.authenticate = void 0;
    var authenticate_1 = require_authenticate();
    Object.defineProperty(exports2, "authenticate", { enumerable: true, get: function() {
      return authenticate_1.authenticate;
    } });
    var AWS_1 = require_AWS();
    Object.defineProperty(exports2, "AWS", { enumerable: true, get: function() {
      return AWS_1.AWS;
    } });
    var Bsn_1 = require_Bsn();
    Object.defineProperty(exports2, "Bsn", { enumerable: true, get: function() {
      return Bsn_1.Bsn;
    } });
    var environmentVariables_1 = require_environmentVariables();
    Object.defineProperty(exports2, "environmentVariables", { enumerable: true, get: function() {
      return environmentVariables_1.environmentVariables;
    } });
    var Storage_1 = require_Storage();
    Object.defineProperty(exports2, "S3Storage", { enumerable: true, get: function() {
      return Storage_1.S3Storage;
    } });
  }
});

// src/Construct/lambda/fillTable.lambda.ts
var fillTable_lambda_exports = {};
__export(fillTable_lambda_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(fillTable_lambda_exports);

// src/Config.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_utils = __toESM(require_lib());
var Config = class {
  constructor(provider) {
    if (!provider) {
      if (!process.env.APP_CONFIG_TABLENAME) {
        throw Error("Config provider or process.env.APP_CONFIG_TABLENAME must be set");
      }
      this.provider = new DynamoDbConfigProvider(process.env.APP_CONFIG_TABLENAME);
    } else {
      this.provider = provider;
    }
    this.values = /* @__PURE__ */ new Map();
  }
  /**
   * Check if a config key exists, without retrieving all referenced params
   *
   * @param key the key to check
   * @returns boolean
   */
  async has(key) {
    let value = this.values.get(key);
    if (!value) {
      value = await this.provider.get(key);
      this.values.set(key, value);
    }
    return value ? true : false;
  }
  /**
   * Get the value of a config key
   *
   * @param key the key to get
   * @returns the value of the config object, with references to secrets manager and parameter store resolved to their values.
   */
  async get(key) {
    let value = this.values.get(key);
    if (!value) {
      value = await this.provider.get(key);
      if (typeof value == "string" && value.startsWith("arn")) {
        value = await this.retrieveReferencedValue(value);
      } else if (typeof value == "object" || Array.isArray(value)) {
        value = await this.retrieveNestedReferencedValues(value);
      }
      this.values.set(key, value);
    }
    return value;
  }
  async set(key, value) {
    return this.provider.set(key, value);
  }
  /**
   * Adds keys if they don't already exist. Used by the CF custom resource for
   * updating the config without overwriting existing configuration.
   *
   * @param initial config object
   */
  async addKeys(initial) {
    const keys = Object.keys(initial);
    console.log("Changing config (creating new keys)", keys);
    for (let key of keys) {
      if (!await this.has(key)) {
        await this.set(key, initial[key]);
      }
    }
  }
  async retrieveReferencedValue(arn) {
    if (arn.startsWith("arn:aws:secretsmanager:")) {
      return this.provider.getSecret(arn);
    } else if (arn.startsWith("arn:aws:ssm") && arn.includes("parameter")) {
      return this.provider.getParameter(arn);
    }
    return arn;
  }
  async retrieveNestedReferencedValues(objectOrArray) {
    if (Array.isArray(objectOrArray)) {
      let newArray = [];
      for (let value of objectOrArray) {
        if (typeof value == "string") {
          if (value.startsWith("arn")) {
            newArray.push(await this.retrieveReferencedValue(value));
          } else {
            newArray.push(value);
          }
        } else if (typeof value == "object" || Array.isArray(value)) {
          newArray.push(await this.retrieveNestedReferencedValues(value));
        }
      }
      return newArray;
    } else if (typeof objectOrArray == "object") {
      const keys = Object.keys(objectOrArray);
      const object = objectOrArray;
      for (let property of keys) {
        if (typeof object[property] == "string") {
          if (object[property].startsWith("arn")) {
            object[property] = await this.retrieveReferencedValue(object[property]);
          }
        } else if (typeof object[property] == "object" || Array.isArray(typeof object[property])) {
          object[property] = await this.retrieveNestedReferencedValues(object[property]);
        }
      }
      return object;
    } else {
      throw Error(`unexpected parameter type, ${typeof objectOrArray}`);
    }
  }
};
var DynamoDbConfigProvider = class {
  constructor(tableName, client) {
    this.tableName = tableName;
    this.client = client ?? new import_client_dynamodb.DynamoDBClient();
  }
  async get(key) {
    const input = new import_client_dynamodb.GetItemCommand({
      TableName: this.tableName,
      // required
      Key: {
        pk: {
          S: key
        }
      }
    });
    const result = await this.client.send(input);
    if (result?.Item?.value?.S) {
      return JSON.parse(result.Item.value.S);
    } else {
      return false;
    }
  }
  async set(key, value) {
    const input = new import_client_dynamodb.PutItemCommand({
      TableName: this.tableName,
      // required
      Item: {
        pk: {
          S: key
        },
        value: {
          S: JSON.stringify(value)
        }
      }
    });
    const result = await this.client.send(input);
    if (result.$metadata.httpStatusCode && result.$metadata.httpStatusCode > 299) {
      return false;
    }
    return true;
  }
  async getSecret(arn) {
    return import_utils.AWS.getSecret(arn);
  }
  async getParameter(arn) {
    return import_utils.AWS.getParameter(arn);
  }
};

// src/Construct/lambda/fillTable.lambda.ts
async function handler(event) {
  console.debug(JSON.stringify(event));
  if (event.RequestType == "Create") {
    const config = new Config();
    const initial = event.ResourceProperties.initialConfig;
    const keys = Object.keys(initial);
    console.log("Changing config (creating keys)", keys);
    const promises = keys.map((key) => config.set(key, initial[key]));
    await Promise.all(promises);
  } else if (event.RequestType == "Update") {
    const policy = event.ResourceProperties.updatePolicy;
    if (policy == "ignore") {
      console.log("Update policy is ignore, exiting");
      return;
    }
    const config = new Config();
    const initial = event.ResourceProperties.initialConfig;
    const keys = Object.keys(initial);
    console.log(`Changing config (updating keys with policy ${event.ResourceProperties.updatePolicy})`, keys);
    if (policy == "add") {
      await config.addKeys(initial);
    } else {
      console.warn("no policy selected, ignoring");
    }
  } else if (event.RequestType == "Delete") {
    console.warn("Delete requested, no action. Backing table will be deleted");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
