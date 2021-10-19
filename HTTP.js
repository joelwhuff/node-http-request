import http from "http";

const MIME_TYPES = {
  css: "text/css",
  csv: "text/csv",
  gif: "image/gif",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  mp3: "audio/mp3",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  png: "image/png",
  pdf: "application/pdf",
  svg: "image/svg+xml",
  ttf: "font/ttf",
  txt: "text/plain",
  wav: "audio/wav",
  weba: "audio/webm",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  txt: "text/plain",
  xhtml: "application/xhtml+xml",
  zip: "application/zip",
};

const text_types = /text|svg|xhtml/;

export default class HTTP {
  static get(url) {
    return new Promise((resolve, reject) => {
      let req = http.request(
        url,
        {
          method: "GET",
        },
        (res) => {
          let data = [];

          res.on("data", (chunk) => {
            data.push(chunk);
          });

          res.on("end", () => {
            const buf = Buffer.concat(data);
            if (text_types.test(res.headers["content-type"])) {
              resolve(buf.toString("utf8"));
            } else {
              resolve(buf);
            }
          });

          res.on("error", reject);
        }
      );

      req.on("error", reject);

      req.end();
    });
  }
}
