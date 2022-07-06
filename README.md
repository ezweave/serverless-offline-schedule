# serverless-offline-schedule

This is a fork of [`serverless-offline-schedule`](https://github.com/Meemaw/serverless-offline-schedule) as that project is no longer maintained.

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-offline-schedule.svg)](https://badge.fury.io/js/serverless-offline-schedule)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://coveralls.io/repos/github/Meemaw/serverless-offline-schedule/badge.svg?branch=master)](https://coveralls.io/github/Meemaw/serverless-offline-schedule?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Install Plugin

`npm install --save-dev serverless-offline-schedule`

Then in `serverless.yml` add following entry to the plugins array: `serverless-offline-schedule`

```yml
plugins:
  - serverless-offline-schedule
```

## Using the Plugin

#### Standalone process

```sh
λ → sls schedule
Serverless: Starting serverless-offline-schedule in standalone process. Press CTRL+C to stop.
Serverless: Scheduling [schedule-function] cron: [*/1 * * * *] input: {"scheduler":"1-minute"}
...
Serverless: Succesfully invoked scheduled function: [my-function]
```

#### Part of serverless-offline

`serverless-offline-schedule` will automatically hook into `serverless-offline` start command hook.

```sh
λ → sls offline
...
Serverless: Scheduling [schedule-function] cron: [*/1 * * * *] input: {"scheduler":"1-minute"}
...
Serverless: Succesfully invoked scheduled function: [my-function]
```
