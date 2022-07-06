import schedule from 'node-schedule';

import Scheduler from '../src/scheduler';

describe('OfflineScheduler', () => {
  let scheduleFunction;

  beforeEach(() => {
    scheduleFunction = {
      'schedule-function': {
        handler: 'src/functions/schedule-function.handler',
        events: [
          {
            schedule: {
              name: '1-minute',
              rate: 'rate(1 minute)',
              input: { scheduler: '1-minute' },
            },
          },
        ],
        name: 'my-service-dev-schedule-function',
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should not schedule any jobs when no functions provided', () => {
    const log = jest.fn();
    const scheduler = new Scheduler({
      log,
      functionProvider: () => {
        return {};
      },
    });

    scheduler.scheduleEvents();
    expect(log).toBeCalledTimes(0);
  });

  it('Should not schedule and jobs when function with no evets provided', () => {
    const log = jest.fn();
    const scheduler = new Scheduler({
      log,
      functionProvider: () => {
        return {
          'get-user': {
            handler: 'src/handlers/get-useer.handler',
            events: [],
            name: 'my-service-dev-get-user',
          },
        };
      },
    });

    scheduler.scheduleEvents();
    expect(log).toBeCalledTimes(0);
  });

  it('Should schedule job when function with schedule provided', () => {
    const log = jest.fn();
    const scheduleJob = jest.spyOn(schedule, 'scheduleJob');
    const scheduler = new Scheduler({
      log,
      functionProvider: () => scheduleFunction,
    });

    scheduler.scheduleEvents();
    expect(log).toBeCalledWith(
      'Scheduling [schedule-function] cron: [*/1 * * * *] input: {"scheduler":"1-minute"}'
    );
    expect(scheduleJob).toBeCalledTimes(1);
  });

  it('Should schedule job in standalone process when function with schedule provided', () => {
    const log = jest.fn();
    const scheduleJob = jest.spyOn(schedule, 'scheduleJob');
    const scheduler = new Scheduler({
      log,
      functionProvider: () => scheduleFunction,
    });

    scheduler.scheduleEventsStandalone();
    expect(log).nthCalledWith(
      1,
      'Starting serverless-offline-schedule in standalone process. Press CTRL+C to stop.'
    );
    expect(log).nthCalledWith(
      2,
      'Scheduling [schedule-function] cron: [*/1 * * * *] input: {"scheduler":"1-minute"}'
    );
    expect(scheduleJob).toBeCalledTimes(1);
  });

  it('Should schedule job with multiple schedules', () => {
    const log = jest.fn();
    scheduleFunction['schedule-function'].events[0].schedule.rate = [
      'rate(1 minute)',
      'rate(2 minute)',
    ];
    const scheduleJob = jest.spyOn(schedule, 'scheduleJob');
    const scheduler = new Scheduler({
      log,
      functionProvider: () => scheduleFunction,
    });

    scheduler.scheduleEvents();
    expect(log).toBeCalledWith(
      'Scheduling [schedule-function] cron: [*/1 * * * *,*/2 * * * *] input: {"scheduler":"1-minute"}'
    );
    expect(scheduleJob).toBeCalledTimes(2);
  });
});
