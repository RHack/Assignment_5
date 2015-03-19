#!/usr/bin/env node

"use strict";

var http = require("http"), querystring = require("querystring");

//-------------- GET STUFF --------------

function beginPage(res, title) {
    res.write("<!DOCTYPE html>\n");
    res.write("<html lang='en'>\n");
    res.write("<head>\n");
    res.write("<meta charset='utf-8'>\n");
    res.write("<title>"+ title + "</title>\n");
    res.write("<link rel='stylesheet' href='style.css' type='text/css'>\n");
    res.write("</head>\n");
    res.write("<body>\n");
}

function endPage(res) {
    res.write("</body>\n");
    res.write("</html>\n");
    res.end();
}

function writeHeading(res, tag, title) {
    res.write("<" + tag + ">" + title + "</" + tag + ">\n");
}

function writePre(res, divClass, data) {
    var escaped = data.replace(/</, "&lt;").
                       replace(/>/, "&gt;");

    res.write("<div class='" + divClass + "_div'>\n");
    res.write("<pre>");
    res.write(escaped);
    res.write("</pre>\n");
    res.write("</div>\n");
}

function beginForm(res, item) {
    res.write("<form method='POST' action='/play/" + item + "'>\n");
}

function endForm(res, item) {
    res.write("<input type='submit' value='" + item + "'>\n");
    res.write("</form>\n");
}

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

//-------------- NORMAL --------------

function status(res, stat){
    var result = JSON.stringify(stat);
    res.write(result);
    res.end();
}

function redirect(req, res, act, stat){
    writeHeading(res, "h2", "No POST detected, Click Corresponding Link to POST " + act);
    var weapons = ["rock", "paper", "scissors", "lizard", "spock"];
    weapons.forEach(function(wep) {
        beginForm(res, wep);
        endForm(res, wep);
    });
    endPage(res);
    res.end();
}

function play(req, res, act, stat, obj2index, senario){
    var ai = Math.floor(Math.random() * 5);
    var result = senario[obj2index[act]][ai];
    stat.outcome = result;
    if (result == "win"){
        stat.wins+=1;
    } else if (result == "lose") {
        stat.losses+=1;
    } else if (result == "tie") {
        stat.ties+=1;
    } else {
        stat.outcome= "did not count";
    }
    /*
    req.on("end", function () {
        status(res, stat);
    });
    */
    status(res, stat);
    
}

function frontPage(req, res) {
    var obj2index = {rock: 0, paper: 1, scissors: 2, lizard: 3, spock: 4};
    var senario = [ ["tie", "lose", "win" , "win", "lose"],
                    ["win", "tie", "lose" , "lose", "win"],
                    ["lose", "win", "tie" , "win", "lose"],
                    ["lose", "win", "lose" , "tie", "win"],
                    ["win", "lose", "win" , "lose", "tie"]];
    var title = "ROCK PAPER SCISSORS LIZARD SPOCK";

    if(req.method == "POST") {
        
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        if (req.url === "/play/rock") {
            play(req, res, "rock", stat, obj2index, senario);
        } else if (req.url === "/play/paper") {
            play(req, res, "paper", stat, obj2index, senario);
        } else if (req.url === "/play/scissors") {
            play(req, res, "scissors", stat, obj2index, senario);
        } else if (req.url === "/play/lizard") {
            play(req, res, "lizard", stat, obj2index, senario);
        } else if (req.url === "/play/spock") {
            play(req, res, "spock", stat, obj2index, senario);
        } else {
            stat.outcome = "no play";
            status(res, stat);
        }
    } else {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        beginPage(res, "ROCK PAPER SCISSORS LIZARD SPOCK");
        if (req.url === "/play/rock") {
            redirect(req, res, "rock", stat);
        } else if (req.url === "/play/paper") {
            redirect(req, res, "paper", stat);
        } else if (req.url === "/play/scissors") {
            redirect(req, res, "scissors", stat);
        } else if (req.url === "/play/lizard") {
            redirect(req, res, "lizard", stat);
        } else if (req.url === "/play/spock") {
            redirect(req, res, "spock", stat);
        } else {
            stat.outcome = "no play";
            redirect(req, res, "your action", stat);
        }
    } 
}

var stat = {outcome: "no play", wins: 0, losses: 0, ties: 0};
var server = http.createServer(frontPage);
server.listen(11111);
var address = server.address();
console.log("nudge is listening at http://localhost:" + address.port + "/");
