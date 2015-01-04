var _ = require('underscore')
var http = require('http')
var url = require('url')
var querystring = require('querystring')
var geoip = require('geoip-lite')
var argv = require('optimist').argv

var host = argv.h || argv.host || '127.0.0.1'
var port = argv.p || argv.port || 5128

var defaultSearch = ['country', 'city']
var defaultGeoData = {
    range: '',
    country: '',
    region: '',
    city: '',
    ll: [0, 0]
};

/*
req: ip=x.x.x.x&ip=y.y.y.y&query=country&query=city
example: http://192.168.186.102:5117/?ip=180.154.237.252&ip=101.154.237.2&query=country&query=city&query=region&query=ll&query=range
res: JSON.stringify({
        'x.x.x.x': {
            'country': 'CN',
            'city': 'beijing'
        },
        'y.y.y.y': {
            'country': 'CN'
            'city': 'shanghai'
        },
        'z.z.z.z': {    // if 192.168.x.x / 172.16.x.x / 10.x.x.x
            'country': '',
            'city': ''
        }
    })
*/
http.createServer(function (req, res) {
    var query = querystring.parse(url.parse(req.url).query)
    var search = query.query || defaultSearch
    var ips = query.ip || []
    if (_.isString(ips)) {
        ips = [query.ip]
    }

    var i, j, geo, ip, searchName, info, result={}
    for (i in ips) {
        info = {}
        ip = ips[i]
        geo = geoip.lookup(ip) || defaultGeoData
        for (j in search) {
            searchName = search[j]
            info[searchName] = geo[searchName]
        }
        result[ip] = info
    }

    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(JSON.stringify(result))
}).listen(port, host)

console.log('geo ip server listen on %s:%s', host, port)