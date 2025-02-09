import pino from 'pino';
import dayjs from 'dayjs';

export const logger = pino({
    base: {
        pid: false
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});