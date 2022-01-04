import http from 'http';
import https from 'https';

// todo - add support for accept-encoding

const UTF8 = /(text|json|xml|javascript)/;
const REDIRECT = [301, 302, 307, 308];

/**
 * Promise based HTTP request helper
 * @param {(string|URL)} url
 * @param {Object} [options] Node http request options https://nodejs.org/api/http.html#httprequesturl-options-callback
 * @param {(string|Buffer)} [options.body] Data to write to POST requests
 * @returns {Promise} Response
 */
const request = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        let _url = url;
        if (typeof url === 'string') {
            try {
                _url = new URL(url);
            } catch (err) {
                reject(err);
            }
        }

        let client = _url.protocol === 'https:' ? https : http;

        let req = client.request(_url, options, res => {
            if (REDIRECT.includes(res.statusCode)) {
                resolve(request(res.headers.location, options));
            }

            let chunks = [];

            res.on('error', reject)
                .on('data', chunk => {
                    chunks.push(chunk);
                })
                .on('end', () => {
                    let data = Buffer.concat(chunks);
                    resolve({
                        httpVersion: res.httpVersion,
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        headers: res.headers,
                        data: UTF8.test(res.headers['content-type']) ? data.toString() : data,
                    });
                });
        });

        req.on('error', reject);

        if (options.method?.toLowerCase() === 'post' && options.body) {
            req.write(options.body);
        }

        req.end();
    });
};

export default request;
