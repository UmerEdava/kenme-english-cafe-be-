const {CronJob} = require("cron");
const https = require("https");

const URL = "https://kenme-english-cafe-be.onrender.com/user/questions";

const job = new CronJob("*/14 * * * *", function () {
	https
		.get(URL, (res) => {
			if (res.statusCode === 200) {
				console.log("GET request sent successfully");
			} else {
				console.log("GET request failed", res.statusCode);
			}
		})
		.on("error", (e) => {
			console.error("Error while sending request", e);
		});
});

module.exports = job;