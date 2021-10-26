import http from "http";
import https from "https";

// Content-Types to convert to utf-8
const UTF8 = /text|xml|json|ecmascript/;
// HTTP redirect status codes
const REDIRECT = [301, 302, 307, 308];

/**
 * Promise based HTTP request helper. Converts response data
 * to utf-8 depending on the Content-Type header
 *
 * @param {string} [url]
 * @param {Object} [options] Node http request options https://nodejs.org/api/http.html#httprequesturl-options-callback
 * @param {(string|Buffer)} [options.postData] Data to write to POST requests
 * @returns {Promise} Response data
 */
export default async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof url === "string") {
      try {
        let urlObject = new URL(url);
        options.host = urlObject.host;
        options.path = urlObject.pathname + urlObject.search;
        urlObject.port && (options.port = urlObject.port);
        options.protocol = urlObject.protocol;
      } catch (err) {
        reject(err);
      }
    } else {
      Object.assign(options, url);
    }

    let client = options.protocol === "https:" ? https : http;

    let req = client.request(options, (res) => {
      // Automatically resend the request using the specified location
      // Usually when a website redirects you to https from http
      if (REDIRECT.includes(res.statusCode)) {
        resolve(request(res.headers.location, options));
      }

      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        let data = chunks.length ? Buffer.concat(chunks) : null;
        resolve({
          httpVersion: res.httpVersion,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: UTF8.test(res.headers["content-type"]) ? data.toString("utf8") : data,
        });
      });

      res.on("error", reject);
    });

    req.on("error", reject);

    if (options.postData) {
      req.write(options.postData);
    }

    req.end();
  });
}
