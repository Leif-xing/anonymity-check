const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.set('trust proxy', true); // 信任 Railway/Nginx 的代理头

// 辅助函数：获取客户端 IP
const getClientIp = (req) => {
    // x-forwarded-for 格式通常为: "client, proxy1, proxy2"
    // 当 trust proxy 开启时，req.ip 会自动处理，但手动获取更稳健
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress;
};

// 1. /ip - httpbin 兼容：返回来源 IP
app.get('/ip', (req, res) => {
    const ip = getClientIp(req);
    res.json({ origin: ip });
});

// 2. /headers - httpbin 兼容：返回请求头
app.get('/headers', (req, res) => {
    // 过滤掉云平台内部头，尽量还原客户端原始头
    const responseHeaders = { ...req.headers };
    // 定义需要忽略的云平台/CDN 注入的头
    const ignoreHeaders = [
        'x-request-id', 
        'x-railway-routing', 
        'cdn-loop', 
        'cf-ray', 
        'cf-connecting-ip',
        'x-forwarded-proto', // httpbin 通常只返回原始头，这个通常是 LB 加的
        'x-forwarded-port',
        'x-forwarded-host'
    ];
    ignoreHeaders.forEach(h => delete responseHeaders[h]);

    res.json({ headers: responseHeaders });
});

// 3. /user-agent - httpbin 兼容：返回 User-Agent
app.get('/user-agent', (req, res) => {
    res.json({ "user-agent": req.headers['user-agent'] });
});

// 4. /get - httpbin 兼容：返回详细信息
app.get('/get', (req, res) => {
    const ip = getClientIp(req);
    // 同样进行 headers 过滤
    const responseHeaders = { ...req.headers };
    const ignoreHeaders = ['x-request-id', 'x-railway-routing', 'cdn-loop'];
    ignoreHeaders.forEach(h => delete responseHeaders[h]);

    res.json({
        args: req.query,
        headers: responseHeaders,
        origin: ip,
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    });
});

// 默认路由
app.get('/', (req, res) => {
    res.send('httpbin clone is running. Available endpoints: /ip, /headers, /user-agent, /get');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} (IPv4 Only)`);
});