import chalk from "chalk";

export const logError = (message: string) => console.error(`${chalk.red.bold("Error:")} ${message}`);

export const logInfo = (message: string) => console.info(`${chalk.blue("Info:")} ${message}`);

export const logAction = (action: string, payload: any) => logInfo(`Executed action ${action} with payload ${JSON.stringify(payload)}.`);
