import childProcess from 'child_process';

const convertRateToCron = (rate: string): string => {
  const parts = rate.split(' ');
  if (!parts[1]) {
    throw new Error(`Invalid rate format: '${rate}'`);
  }

  if (parts[1].startsWith('minute')) {
    return `*/${parts[0]} * * * *`;
  }

  if (parts[1].startsWith('hour')) {
    return `0 */${parts[0]} * * *`;
  }

  if (parts[1].startsWith('day')) {
    return `0 0 */${parts[0]} * *`;
  }

  throw new Error(`Invalid rate format: '${rate}'`);
};

export const convertExpressionToCron = (scheduleRate: string): string => {
  if (scheduleRate.startsWith('cron(')) {
    return scheduleRate.replace('cron(', '').replace(')', '');
  }

  if (scheduleRate.startsWith('rate(')) {
    const params = scheduleRate.replace('rate(', '').replace(')', '');
    return convertRateToCron(params);
  }

  throw new Error(`Invalid schedule rate: '${scheduleRate}'`);
};

export const slsInvokeFunction = (name: string, input: object): Buffer => {
  return childProcess.execSync(
    `serverless invoke local --function ${name} --data '${JSON.stringify(input)}'`,
    { cwd: './', stdio: 'inherit' }
  ) as Buffer;
};
