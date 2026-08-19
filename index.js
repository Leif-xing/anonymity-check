const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.set('trust proxy', true); // 信任 Vercel/Railway/Nginx 的代理头

// 辅助函数：获取客户端 IP
const getClientIp = (req) => {
    const xRealIp = req.headers['x-real-ip'];
    if (xRealIp) return xRealIp.trim();

    // x-forwarded-for 格式通常为: "client, proxy1, proxy2"
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket ? req.socket.remoteAddress : '';
};

// 通用头过滤函数：过滤云平台/CDN注入的内部头
const filterHeaders = (headers) => {
    const responseHeaders = { ...headers };
    const ignoreHeaders = [
        'x-request-id', 
        'x-railway-routing', 
        'cdn-loop', 
        'cf-ray', 
        'cf-connecting-ip',
        'x-forwarded-proto',
        'x-forwarded-port',
        'x-forwarded-host',
        // Vercel 平台特定注入头
        'x-vercel-id',
        'x-vercel-deployment-url',
        'x-vercel-forwarded-for',
        'x-vercel-ip-continent',
        'x-vercel-ip-country',
        'x-vercel-ip-country-region',
        'x-vercel-ip-city',
        'x-vercel-ip-latitude',
        'x-vercel-ip-longitude',
        'x-vercel-proxied-for',
        'x-vercel-proxy-signature',
        'x-vercel-proxy-signature-options',
        'x-vercel-sc-host',
        'x-vercel-ja3-digest',
        'x-matched-path'
    ];
    ignoreHeaders.forEach(h => delete responseHeaders[h.toLowerCase()]);
    return responseHeaders;
};

// 1. /ip - httpbin 兼容：返回来源 IP
app.get('/ip', (req, res) => {
    const ip = getClientIp(req);
    res.json({ origin: ip });
});

// 2. /headers - httpbin 兼容：返回请求头
app.get('/headers', (req, res) => {
    res.json({ headers: filterHeaders(req.headers) });
});

// 3. /user-agent - httpbin 兼容：返回 User-Agent
app.get('/user-agent', (req, res) => {
    res.json({ "user-agent": req.headers['user-agent'] || '' });
});

// 4. /get - httpbin 兼容：返回详细信息
app.get('/get', (req, res) => {
    const ip = getClientIp(req);
    res.json({
        args: req.query,
        headers: filterHeaders(req.headers),
        origin: ip,
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    });
});

// 默认路由
app.get('/', (req, res) => {
    res.send('httpbin clone is running. Available endpoints: /ip, /headers, /user-agent, /get');
});

// 本地直接运行（node index.js）时监听端口；Vercel 部署时通过 module.exports 导出 Express 实例
if (require.main === module) {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;