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

// 头过滤函数：精确控制请求头输出
const filterHeaders = (headers) => {
    const responseHeaders = {};
    
    // 1. 明确保留的边缘节点/地理位置与时区检测头
    const keepExact = new Set([
        'x-vercel-ip-timezone',
        'cf-ipcountry'
    ]);

    // 2. 明确移除的冗余/代理/平台内部注入头
    const ignoreExact = new Set([
        'forwarded',
        'x-invocation-id',
        'x-request-id',
        'x-railway-routing',
        'cdn-loop',
        'x-matched-path',
        'x-forwarded-proto',
        'x-forwarded-port',
        'x-forwarded-host',
        'connection'
    ]);

    for (const [key, value] of Object.entries(headers)) {
        const lowerKey = key.toLowerCase();
        
        // 优先检查显式保留清单
        if (keepExact.has(lowerKey)) {
            responseHeaders[key] = value;
            continue;
        }

        // 显式忽略清单
        if (ignoreExact.has(lowerKey)) {
            continue;
        }

        // 过滤其余 x-vercel-* 与 cf-* 底层内部标头
        if (lowerKey.startsWith('x-vercel-') || lowerKey.startsWith('cf-')) {
            continue;
        }

        responseHeaders[key] = value;
    }

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