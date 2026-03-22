const LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
let currentLevel = 'info';
export function setLogLevel(level) {
    currentLevel = level;
}
function shouldLog(level) {
    return LEVELS[level] >= LEVELS[currentLevel];
}
function formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (meta !== undefined) {
        const metaStr = meta instanceof Error
            ? meta.stack ?? meta.message
            : JSON.stringify(meta, null, 2);
        return `${prefix} ${message}\n${metaStr}`;
    }
    return `${prefix} ${message}`;
}
export const logger = {
    debug(message, meta) {
        if (shouldLog('debug')) {
            console.debug(formatMessage('debug', message, meta));
        }
    },
    info(message, meta) {
        if (shouldLog('info')) {
            console.info(formatMessage('info', message, meta));
        }
    },
    warn(message, meta) {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', message, meta));
        }
    },
    error(message, meta) {
        if (shouldLog('error')) {
            console.error(formatMessage('error', message, meta));
        }
    },
};
//# sourceMappingURL=logger.js.map