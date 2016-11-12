# Getting Started
- Tested with Node Version 6.0.0 & npm version 3.10.5
- Rename `example-config.js` to `config.js` and edit the properties

To run:
```bash
npm install
npm start
```

###Example URL:
[http://localhost:8000/vehicle/search?city=omaha&minAsk=5000&maxAsk=15000&minAutoYear=2005&maxAutoYear=2016&autoMakeModel=lexus](http://localhost:8000/vehicle/search?city=omaha&minAsk=5000&maxAsk=15000&minAutoYear=2005&maxAutoYear=2016&autoMakeModel=lexus)

###Example response:

```javascript
[
  {
    "category": "",
    "date": "2016-11-12 00:00",
    "hasPic": true,
    "location": "",
    "pid": "123456789",
    "price": "$10800",
    "title": "2007 LEXUS IS 250 AWD",
    "url": "https://omaha.craigslist.org/cto/123456789.html"
  },
  {
    "category": "",
    "date": "2016-11-11 00:00",
    "hasPic": true,
    "location": "",
    "pid": "123456789",
    "price": "$9950",
    "title": "2009 Lexus IS250 AWD SPORT",
    "url": "https://omaha.craigslist.org/cto/123456789.html"
  }
]
```

###Email format:
```
2007 LEXUS IS 250 AWD: $10800
https://omaha.craigslist.org/cto/123456789.html

2009 Lexus IS250 AWD SPORT: $9950
https://omaha.craigslist.org/cto/123456789.html
```