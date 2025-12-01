const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// CHANGE THIS to your own domain
const TARGET = "https://YOUR-DOMAIN.com";

app.use("/", createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
        // Remove blocking headers
        delete proxyRes.headers["x-frame-options"];
        delete proxyRes.headers["content-security-policy"];
    }
}));

app.listen(3000, () => {
    console.log("Proxy running on http://localhost:3000");
});
