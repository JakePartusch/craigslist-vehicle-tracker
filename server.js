'use strict';

const Hapi = require('hapi');
const craigslist = require('./node-craigslist');
const server = new Hapi.Server();
const config = require('./config.js');
var mailgun = require('mailgun-js')({apiKey: config.mailgun.apiKey, domain: config.mailgun.domain});

server.connection({
    host: config.host,
    port: 8000
});

server.route({
    method: 'GET',
    path:'/vehicle/search',
    handler: function (request, reply) {
        let client = new craigslist.Client({
            city : request.query.city
        });
        client.search(createSearchQuery(request)).then((listings) => {
            let mailListings = findListingsInPastDay(listings);
            if(mailListings.length > 0) {
                sendMail(mailListings);
            }
            return reply(mailListings);
        }).catch((err) => {
            console.error(err);
            return reply([]);
        });
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});

function findListingsInPastDay(listings) {
    let yesterday = getYesterday();
    return listings.filter((listing) => {
        return new Date(listing.date).getTime() > yesterday.getTime();
    });
}

function getYesterday() {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}

function createSearchQuery (request) {
    return {
        category: 'cta',
        maxAsk: request.query.maxAsk,
        minAsk: request.query.minAsk,
        minAutoYear: request.query.minAutoYear,
        maxAutoYear: request.query.maxAutoYear,
        autoMakeModel: request.query.autoMakeModel
    }
}

function sendMail(listings) {
    var data = {
        from: 'Craigslist Tracker' +  '<' + config.senderEmail + '>',
        to: config.recipientEmail,
        subject: 'Craigslist Listing Results ' + new Date().toDateString(),
        text: createBodyFromListings(listings)
    };

    mailgun.messages().send(data, function (error, body) {
        if(error) {
            console.log(error);
        }
    });
}

function createBodyFromListings(listings) {
    let body = '';
    listings.forEach((listing) => {
        body += listing.title + ': ' + listing.price + '\n' + listing.url + '\n\n';
    });
    return body;
}