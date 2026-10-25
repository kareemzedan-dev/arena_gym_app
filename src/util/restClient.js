import { BASE_URL } from './Api';
import performanceMonitor from './PerformanceMonitor';
import monitoringService from './MonitoringService';
import config from './Config';
import authManager from './AuthManager';

export class RestClient {

    constructor(baseUrl) {
        this._baseUrl = baseUrl;
        this._timeout = config.apiTimeout;
        this._cache = new Map(); // Simple in-memory cache
        this._cacheTimeout = config.performanceCacheTimeout;

        this._headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
    }

    /** Generate cache key for request */
    _generateCacheKey(url, method, data) {
        return `${method}:${url}:${JSON.stringify(data || {})}`;
    }

    /** Check if cached response is still valid */
    _isCacheValid(cacheEntry) {
        return cacheEntry && (Date.now() - cacheEntry.timestamp) < this._cacheTimeout;
    }

    /** Get cached response if available and valid */
    _getCachedResponse(cacheKey) {
        const cacheEntry = this._cache.get(cacheKey);
        if (this._isCacheValid(cacheEntry)) {
            return cacheEntry.data;
        }
        return null;
    }

    /** Cache response */
    _cacheResponse(cacheKey, data) {
        this._cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    /** Clear expired cache entries */
    _clearExpiredCache() {
        const now = Date.now();
        for (const [key, entry] of this._cache.entries()) {
            if (now - entry.timestamp > this._cacheTimeout) {
                this._cache.delete(key);
            }
        }
    }

    /** POST with body */
    postWithBody(url, data) {
        return performanceMonitor.measureApiCall(`POST ${url}`, this.callRequest('POST', url, data));
    }

    /* POST without body */
    postWithoutBody(url) {
        return performanceMonitor.measureApiCall(`POST ${url}`, this.callRequest('POST', url));
    }

    postWithBodyToken(url, data, Token) {
        return performanceMonitor.measureApiCall(`POST ${url} (Auth)`, this.callRequestWithToken('POST', url, data, Token));
    }

    /** POST with form data */
    postWithFormData(url, data) {
        return performanceMonitor.measureApiCall(`POST ${url} (Form)`, this.callRequestWithFormToken('POST', url, data));
    }

    /** Create timeout promise with AbortController */
    createTimeoutPromise(timeout, controller) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                controller.abort();
                reject(new Error(`Request timeout after ${timeout}ms`));
            }, timeout);
        });
    }

    /** callRequest for non authenticated method */
    async callRequest(method, url, data = null) {
        const API_URL = `${this._baseUrl}=${url}`;
        const startTime = Date.now();
        
        // For GET requests, check cache first
        if (method === 'GET') {
            const cacheKey = this._generateCacheKey(url, method, data);
            const cachedResponse = this._getCachedResponse(cacheKey);
            if (cachedResponse) {
                // Log cache hit
                monitoringService.logApiCall(url, method, Date.now() - startTime, 'cache_hit');
                return cachedResponse;
            }
        }

        try {
            const controller = new AbortController();
            const fetchPromise = fetch(API_URL, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: data ? JSON.stringify(data) : null,
                signal: controller.signal
            });

            const timeoutPromise = this.createTimeoutPromise(this._timeout, controller);
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                const duration = Date.now() - startTime;
                monitoringService.logApiCall(url, method, duration, response.status);
                
                // Check for auth errors
                await authManager.handleApiResponse(null, response.status);
                
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseJson = await response.json();
            const duration = Date.now() - startTime;
            
            // Check response for auth errors
            await authManager.handleApiResponse(responseJson);
            
            // Log successful API call
            monitoringService.logApiCall(url, method, duration, 'success');
            
            // Cache GET responses
            if (method === 'GET' && responseJson.status === 1) {
                const cacheKey = this._generateCacheKey(url, method, data);
                this._cacheResponse(cacheKey, responseJson);
            }
            
            // Clear expired cache periodically
            if (Math.random() < 0.1) { // 10% chance to clean cache
                this._clearExpiredCache();
            }

            return responseJson;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('API call failed:', error);
            
            // Check for auth errors in the catch block
            await authManager.handleFetchError(error);
            
            // Log error to monitoring service
            monitoringService.logError(error, {
                component: 'RestClient',
                action: 'api_call',
                url: API_URL,
                method,
                duration
            });
            
            throw error;
        }
    }

    /** callRequestWithToken for authentication token */
    async callRequestWithToken(method, url, data, token) {
        const API_URL = `${this._baseUrl}=${url}`;

        try {
            const controller = new AbortController();
            const fetchPromise = fetch(API_URL, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: data ? JSON.stringify(data) : null,
                signal: controller.signal
            });

            const timeoutPromise = this.createTimeoutPromise(this._timeout, controller);
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                // Check for auth errors with status code
                await authManager.handleApiResponse(null, response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseJson = await response.json();
            
            // Check response for auth errors
            await authManager.handleApiResponse(responseJson);
            
            return responseJson;
        } catch (error) {
            console.error('API call with token failed:', error);
            
            // Check for auth errors in the catch block
            await authManager.handleFetchError(error);
            
            // Log API error to monitoring service
            monitoringService.logError(error, {
                component: 'RestClient',
                action: 'api_call_with_token',
                url: API_URL,
                method,
                data,
                isFatal: false
            });
            throw error;
        }
    }

    /** call request with formdata and api token */
    async callRequestWithFormToken(method, url, data) {
        const API_URL = `${this._baseUrl}=${url}`;

        try {
            const controller = new AbortController();
            const fetchPromise = fetch(API_URL, {
                method: method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                body: data ? JSON.stringify(data) : null,
                signal: controller.signal
            });

            const timeoutPromise = this.createTimeoutPromise(this._timeout, controller);
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                // Check for auth errors with status code
                await authManager.handleApiResponse(null, response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseJson = await response.json();
            
            // Check response for auth errors
            await authManager.handleApiResponse(responseJson);
            
            return responseJson;
        } catch (error) {
            console.error('API call with form token failed:', error);
            
            // Check for auth errors in the catch block
            await authManager.handleFetchError(error);
            
            // Log API error to monitoring service
            monitoringService.logError(error, {
                component: 'RestClient',
                action: 'api_call_with_form_token',
                url: API_URL,
                method,
                data,
                isFatal: false
            });
            throw error;
        }
    }

}

export const defaultRestClient = new RestClient(BASE_URL);