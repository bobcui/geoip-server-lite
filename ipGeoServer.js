var http = require('http')
var url = require('url')
var querystring = require('querystring')
var geoip = require('geoip-lite')
var _ = require('underscore')

var host = '127.0.0.1'
var port = 5127

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
            'country':
            'city':
        },
        'y.y.y.y': {
            'country':
            'city':
        },
        'z.z.z.z': null (if wrong)
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

console.log('ip lookup server listen on %s:%s', host, port)