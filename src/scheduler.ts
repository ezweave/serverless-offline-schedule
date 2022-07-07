import schedule from 'node-schedule';
import flatten from 'lodash.flatten';
import { map } from 'lodash';

import { convertExpressionToCron, slsInvokeFunction } from './utils';

type FunctionProvider = () => {
  [functionName: string]: Serverless.Function;
};

type SchedulerConfig = {
  log?: (message: string) => void;
  functionProvider: FunctionProvider;
};

type FunctionConfiguration = {
  input: object;
  functionName: string;
  cron: string[];
};

class OfflineScheduler {
  private log: (message: string) => void;
  private functionProvider: FunctionProvider;

  public constructor(config: SchedulerConfig) {
    const { log = console.log, functionProvider } = config;
    this.log = log;
    this.functionProvider = functionProvider;
  }

  public scheduleEventsStandalone = () => {
    this.log('Starting serverless-offline-schedule in standalone process. Press CTRL+C to stop.');
    return Promise.resolve(this.scheduleEvents()).then(this.listenForTermination);
  };

  public scheduleEvents = () => {
    const configurations = this.getFunctionConfigurations();

    map(configurations, (functionConfiguration: FunctionConfiguration) => {
      const { functionName, cron, input } = functionConfiguration;
      this.log(`Scheduling [${functionName}] cron: [${cron}] input: ${JSON.stringify(input)}`);

      map(cron, (cronJob: string) => {
        schedule.scheduleJob(cronJob, (fireDate: Date) => {
          try {
            this.log(`Attempting to invoke scheduled function: [${functionName}] on ${fireDate}`);
            slsInvokeFunction(functionName, input);
            this.log(`Succesfully invoked scheduled function: [${functionName}] on ${fireDate}`);
          } catch (err) {
            this.log(
              `Failed to execute scheduled function: [${functionName}] Error: ${err} on ${fireDate}`
            );
          }
        });
      });
    });
  };

  private getFunctionConfigurations = (): FunctionConfiguration[] => {
    const functions = this.functionProvider();

    const scheduleConfigurations = Object.keys(functions).map(functionName => {
      const functionConfig = functions[functionName];
      const { events } = functionConfig;
      const scheduleEvents = events.filter(event => event.hasOwnProperty('schedule'));

      return map(scheduleEvents, event => {
        const { input = {}, rate: possibleRate } = event['schedule'];
        const rate: string[] = Array.isArray(possibleRate) ? possibleRate : [possibleRate];
        return {
          functionName,
          cron: map(rate, convertExpressionToCron),
          input,
        };
      });
    });

    return flatten(scheduleConfigurations);
  };

  private listenForTermination = () => {
    // SIGINT: usually sent when user presses CTRL+C
    const waitForSigInt = new Promise(resolve => {
      process.on('SIGINT', () => resolve('SIGINT'));
    });

    // SIGTERM: default termination signal in many cases
    const waitForSigTerm = new Promise(resolve => {
      process.on('SIGTERM', () => resolve('SIGTERM'));
    });

    return Promise.race([waitForSigInt, waitForSigTerm]).then(command => {
      this.log(`Got ${command} signal. Stopping serverless-offline-scheduleer...`);
      process.exit(0);
    });
  };
}

export default OfflineScheduler;
