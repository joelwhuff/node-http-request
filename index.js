import HTTP from "./HTTP.js";

Promise.all([
  HTTP.get("http://canvasrider.com"),
  HTTP.get("http://canvasrider.com"),
  HTTP.get("http://canvasrider.com/tracks/1"),
  HTTP.get("http://canvasrider.com"),
])
  .then((data) => {
    console.log(data[2]);
  })
  .catch(console.error);
