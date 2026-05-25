const secretId = "581026d3-d577-4fc2-9469-9aaeec308c27";
const secretPassword = "82a2191e1bacd5c3f5618bf028de73c66760d887";

const auth = Buffer.from(`${secretId}:${secretPassword}`).toString("base64");

fetch("https://api.sandbox.directdebit.belvo.com/payment_requests?limit=10&search=&page=1", {
  method: "GET",
  headers: {
    "Authorization": `Basic ${auth}`,
    "Content-Type": "application/json"
  }
})
.then(res => res.json())
.then(console.log);