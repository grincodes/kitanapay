import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;
  @IsString()
  T_DB_USER: string;
  @IsString()
  T_DB_PASS: string;
  @IsString()
  T_DB_HOST: string;
}

class DevEnv {
  @IsString()
  T_DB_DEV_DB_NAME: string;
}

class StagingEnv {
  @IsString()
  T_DB_STG_DB_NAME: string;
}

class Web3Env {
  @IsString()
  ETHEREUM_NETWORK: string;

  @IsString()
  INFURA_PROJECT_ID: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  if (config.NODE_ENV == 'development') {
    const devConfig = plainToInstance(DevEnv, config, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(devConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }
  }

  if (config.NODE_ENV == 'staging') {
    const stagingConfig = plainToInstance(StagingEnv, config, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(stagingConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }
  }

  // web3Env
  const web3EnvConfig = plainToInstance(Web3Env, config, {
    enableImplicitConversion: true,
  });

  const web3EnvErrors = validateSync(web3EnvConfig, {
    skipMissingProperties: false,
  });

  if (web3EnvErrors.length > 0) {
    throw new Error(web3EnvErrors.toString());
  }

  return validatedConfig;
}
