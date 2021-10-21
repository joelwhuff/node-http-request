import http from "http";
import https from "https";

// Text based content types
const UTF8 = /text|xml|json|ecmascript/;
// HTTP redirect status codes
const REDIRECT = [301, 302, 307, 308];

/**
 * Promise based HTTP request helper. Converts response data
 * to utf-8 depending on the HTTP Content-Type
 *
 * @param {string} [url] - optional
 * @param {Object} options - http request options https://nodejs.org/api/http.html#httprequesturl-options-callback. Use options.data to write data to post requests
 * @returns {Promise} - returns response data on success
 */
async function request(url, options = {}) {
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
      // Automatically redo the request using the specified location
      // Usually when a website redirects you to https from http
      if (REDIRECT.includes(res.statusCode)) {
        resolve(request(res.headers.location, options));
      }

      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        let data = Buffer.concat(chunks);
        resolve(UTF8.test(res.headers["content-type"]) ? data.toString("utf8") : data);
      });

      res.on("error", reject);
    });

    req.on("error", reject);

    if (options.data) {
      req.write(options.data);
    }

    req.end();
  });
}

export default request;
