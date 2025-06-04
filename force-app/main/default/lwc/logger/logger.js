import { LightningElement, api } from 'lwc';

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// Get logging level from URL params
function loggingLevel() {
    // Check URL hash for debug mode
    if (window.location.hash === '#debug') {
        return LOG_LEVELS.DEBUG;
    }

    // Check URL parameters as fallback
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has("error") || urlParams.get("error") === "true") {
        return LOG_LEVELS.ERROR;
    }
    if (urlParams.has("warn") || urlParams.get("warn") === "true") {
        return LOG_LEVELS.WARN;
    }
    if (urlParams.has("info") || urlParams.get("info") === "true") {
        return LOG_LEVELS.INFO;
    }
    if (urlParams.has("debug") || urlParams.get("debug") === "true") {
        return LOG_LEVELS.DEBUG;
    }
    return LOG_LEVELS.ERROR;
}

// Safely stringify objects, handling proxies and circular refs
const safeStringify = (obj) => {
    if (obj === null || obj === undefined) return String(obj);
    if (typeof obj !== 'object') return String(obj);
    
    try {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) return '[Circular Reference]';
                seen.add(value);
            }
            return value;
        }, 2);
    } catch (e) {
        return '[Object]';
    }
};

// Format args for logging
const formatArgs = (args) => {
    return args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
            return safeStringify(arg);
        }
        return arg;
    });
};

export const logger = {
    log(level, message, ...args) {
        if (level < loggingLevel()) return;
        
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} ${message}`;
        const formattedArgs = formatArgs(args);

        switch (level) {
            case LOG_LEVELS.DEBUG:
                console.debug(logMessage, ...formattedArgs);
                break;
            case LOG_LEVELS.INFO:
                console.info(logMessage, ...formattedArgs);
                break;
            case LOG_LEVELS.WARN:
                console.warn(logMessage, ...formattedArgs);
                break;
            case LOG_LEVELS.ERROR:
                console.error(logMessage, ...formattedArgs);
                break;
        }
    },

    debug(message, ...args) {
        this.log(LOG_LEVELS.DEBUG, message, ...args);
    },

    info(message, ...args) {
        this.log(LOG_LEVELS.INFO, message, ...args);
    },

    warn(message, ...args) {
        this.log(LOG_LEVELS.WARN, message, ...args);
    },

    error(message, ...args) {
        this.log(LOG_LEVELS.ERROR, message, ...args);
    }
};

export default class Logger extends LightningElement {
    @api componentName = '';

    /**
     * Safely stringify an object, handling proxy objects and circular references
     * @param {*} obj - The object to stringify
     * @returns {string} A string representation of the object
     */
    safeStringify(obj) {
        if (obj === null || obj === undefined) {
            return String(obj);
        }

        // Handle primitive types
        if (typeof obj !== 'object') {
            return String(obj);
        }

        // Handle arrays
        if (Array.isArray(obj)) {
            try {
                return JSON.stringify(obj.map(item => this.safeStringify(item)));
            } catch (e) {
                return '[Array]';
            }
        }

        // Handle objects
        try {
            const seen = new WeakSet();
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return '[Circular Reference]';
                    }
                    seen.add(value);

                    // Handle proxy objects
                    if (value.toString && value.toString() === '[object Proxy]') {
                        const safeObj = {};
                        let hasAccessibleProps = false;
                        
                        // Try to get common properties
                        ['id', 'name', 'type', 'title', 'text', 'value', 'question', 'page', 'panel'].forEach(prop => {
                            try {
                                if (value[prop] !== undefined) {
                                    safeObj[prop] = value[prop];
                                    hasAccessibleProps = true;
                                }
                            } catch (e) {
                                // Skip property if access fails
                                return;
                            }
                        });

                        // If we couldn't access any properties, use console.dir
                        if (!hasAccessibleProps) {
                            try {
                                const dirOutput = [];
                                console.dir(value, { depth: 2, maxArrayLength: 10 }, (output) => dirOutput.push(output));
                                return `[Proxy Object: ${dirOutput.join(' ')}]`;
                            } catch (e) {
                                return '[Proxy Object]';
                            }
                        }
                        
                        return safeObj;
                    }
                }
                return value;
            }, 2);
        } catch (e) {
            return '[Object]';
        }
    }

    /**
     * Format arguments for logging
     * @param {Array} args - The arguments to format
     * @returns {Array} Formatted arguments
     */
    formatArgs(args) {
        return args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                return this.safeStringify(arg);
            }
            return arg;
        });
    }

    log(level, message, ...args) {
        if (level < loggingLevel()) return;

        const prefix = this.componentName ? `[${this.componentName}]` : '';
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} ${prefix} ${message}`;
        const formattedArgs = this.formatArgs(args);

        switch (level) {
            case LOG_LEVELS.DEBUG:
                console.debug(logMessage, ...formattedArgs);
                break;
            case LOG_LEVELS.INFO:
                console.info(logMessage, ...formattedArgs);
                break;
            case LOG_LEVELS.WARN:
                console.warn(logMessage, ...formattedArgs);
                break;
            case LOG_LEVELS.ERROR:
                console.error(logMessage, ...formattedArgs);
                break;
        }
    }

    debug(message, ...args) {
        this.log(LOG_LEVELS.DEBUG, message, ...args);
    }

    info(message, ...args) {
        this.log(LOG_LEVELS.INFO, message, ...args);
    }

    warn(message, ...args) {
        this.log(LOG_LEVELS.WARN, message, ...args);
    }

    error(message, ...args) {
        this.log(LOG_LEVELS.ERROR, message, ...args);
    }
} 