const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const teamAbbreviations = {
    diamondbacks: "ARI",
    braves: "ATL",
    orioles: "BAL",
    redsox: "BOS",
    cubs: "CHC",
    whitesox: "CHW",
    reds: "CIN",
    guardians: "CLE",
    rockies: "COL",
    tigers: "DET",
    astros: "HOU",
    royals: "KCR",
    angels: "LAA",
    dodgers: "LAD",
    marlins: "MIA",
    brewers: "MIL",
    twins: "MIN",
    mets: "NYM",
    yankees: "NYY",
    athletics: "ATH",
    phillies: "PHI",
    pirates: "PIT",
    padres: "SDP",
    giants: "SFG",
    mariners: "SEA",
    cardinals: "STL",
    rays: "TBR",
    rangers: "TEX",
    bluejays: "TOR",
    nationals: "WSN",
  };

  // Directory where CSV files will be saved
  const outputDir = "fetchteamdata/teamdata";

  // Check if the directory exists; if not, create it
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
    console.log(`Created directory: ${outputDir}`);
  }

  // Launch a headless browser
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for (const [teamName, teamAbbr] of Object.entries(teamAbbreviations)) {
    try {
      // Construct the URL
      const url = `https://www.baseball-reference.com/teams/${teamAbbr}/2026-schedule-scores.shtml`;

      // Navigate to the specified URL
      await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

      // Wait for the page to load initial content
      // await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Ensure jQuery is loaded and ready
      // await page.waitForFunction(() => window.jQuery != null);

      // Wait for your specific element to appear
      await page.waitForSelector('#team_schedule', { timeout: 60000 });

      // Run `table2csv("team_schedule")` in the page context
      await page.evaluate(() => {
        table2csv("team_schedule");
      });

      // Wait for the element to be added to the DOM
      await page.waitForSelector("#csv_team_schedule");

      // Extract the team score content
      const content = await page.evaluate(() => {
        const elem = document.getElementById("csv_team_schedule");
        return elem.innerText.match(/Gm#(.|\n)*/)[0];
      });

      // Write the extracted content to an individual CSV file
      const filePath = path.join(outputDir, `${teamName}.csv`);
      fs.writeFileSync(filePath, content);

      console.log(`Saved data for ${teamName}`);

      // Wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      console.error(`Failed to process ${teamName}:`, error.message);
    }
  }

  // Close the browser
  await browser.close();
})();
