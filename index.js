import http from 'http';
import https from 'https';
import { finished } from 'stream';

/**
 * @param {string} url
 * @param {Object} [options]
 * @param {string} [options.method=GET]
 * @param {Object} [options.headers]
 * @param {(string|Buffer)} [options.body]
 * @returns {Promise}
 */
const request = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        let _url;
        try {
            _url = new URL(url);
        } catch (err) {
            reject(err);
            return;
        }

        let client = _url.protocol === 'https:' ? https : http;

        let req = client.request(_url, options, res => {
            let chunks = [];

            finished(res, err => {
                if (err) reject(err);
            });

            res.on('data', chunk => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                let data = Buffer.concat(chunks);

                resolve({
                    httpVersion: res.httpVersion,
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    headers: res.headers,
                    data: /text|javascript|json|xml/.test(res.headers['content-type']) ? data.toString() : data,
                });
            });
        });

        finished(req, err => {
            if (err) reject(err);
        });

        if (options.body) req.write(options.body);

        req.end();
    });
};

export default request;
