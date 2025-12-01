const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const app = express();

app.use(express.static("public")); // for serving your frontend HTML

const BASE = "https://bosbrowse.onrender.com/proxy?url=";

// Convert relative → absolute
function toAbsolute(baseUrl, link) {
    try {
        return new URL(link, baseUrl).href;
    } catch {
        return link;
    }
}

app.get("/proxy", async (req, res) => {
    let target = req.query.url;

    if (!target) return res.status(400).send("Missing ?url=");
    if (!target.startsWith("http")) target = "https://" + target;

    try {
        const response = await fetch(target);
        let contentType = response.headers.get("content-type") || "";

        // If not HTML → return as-is
        if (!contentType.includes("text/html")) {
            const buffer = await response.arrayBuffer();
            return res.type(contentType).send(Buffer.from(buffer));
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Rewriting all important attributes EXCEPT IMAGES
        const rewriteAttributes = [
            "href", "src", "action"
        ];

        $("*").each((i, el) => {
            rewriteAttributes.forEach(attr => {
                const value = $(el).attr(attr);
                if (!value) return;

                // Skip images
                if (attr === "src" && $(el).is("img")) return;

                // Skip javascript: links
                if (value.startsWith("javascript:")) return;

                const absolute = toAbsolute(target, value);
                $(el).attr(attr, BASE + encodeURIComponent(absolute));
            });
        });

        res.send($.html());
    } catch (err) {
        res.status(500).send("Proxy Error: " + err.message);
    }
});

app.listen(3000, () => {
    console.log("Proxy server running on port 3000");
});
