const axios = require("axios");

async function main() {
  const response = await axios.post("http://127.0.0.1:5000/api/auth/login", {
    name: "Demo Patient",
    dob: "2000-01-01",
  });

  console.log(JSON.stringify(response.data));
}

main().catch((error) => {
  if (error.response) {
    console.error(JSON.stringify(error.response.data));
  } else {
    console.error(error.message);
  }
  process.exit(1);
});