// saved buffer

var saveFlowTimeout = null;
var wordcount = 0;
var score = 0;
var sv_time = 0;
var flowing = false;

function saveFlow() {
    var text = $('#playingfield').val();
    var chars = text.length;
    var words = getWordCount(text);
    var flow_time = getElapsedSeconds();

    freezeFlowAndReset(text);

    wordcount += words;
    score += getScore(text, flow_time);

    scoreBoardUpdate(wordcount, score);

    updateFlowStatus();
    displayEncouragement(score);

    flowing = false;
}

function displayEncouragement(score) {
    var word;
    if (score > 10) { word = "okay"; }
    if (score > 20) { word = "cool"; }
    if (score > 40) { word = "nice"; }
    if (score > 60) { word = "sweet"; }
    if (score > 80) { word = "great"; }
    if (score > 120) { word = "awesome"; }
    if (score > 160) { word = "amazing"; }
    if (score > 200) { word = "incredible"; }
    if (score > 280) { word = "spectacular"; }
    if (score > 360) { word = "unbelievable"; }
    if (score > 440) { word = "extraordinary"; }
    $('.encouragement').html(word + " flow!");
    $('.encouragement').css("display", "block");
}

function hideEncouragement() {
    $('.encouragement').css("display", "none");
}

function freezeFlowAndReset(text) {
    $('.tekstflyt').before("<div class='text-content'><p>" + text + "</p></div>");
    $('#playingfield').val("");
}

function scoreBoardUpdate(wordcount, score) {
    $('#scoreboard').html("<h2>Words: <b>" + wordcount + "</b> | Score: <b>" + score + "</b><h2>");
}

function scroll() {
    $("html, body").animate({ scrollTop: $('#playingfield').offset().top }, "slow");
}


// scores should be higher the longer the text is
// scores should be higher the longer the time is
// scores should be higher the higher the ratio of text to time is
function getScore(text, time) {
    var chars = text.length;
    var words = getWordCount(text);
    var wpm = (words / time) * 60;
    var score = Math.round(words*5*wpm/40);
    return score;
}

function getWordCount(text) {
    if (text == "") {
        return 0;
    }

    s = text.replace(/(^\s*)|(\s*$)/gi,"");
    s = s.replace(/[ ]{2,}/gi," ");
    s = s.replace(/\n /,"\n");
    return s.split(' ').length;
}

updateFlowStatus = function() {
    var text = $('#playingfield').val();
    var chars = text.length;
    var words = getWordCount(text);
    var seconds = getElapsedSeconds();
    var wpm = Math.round(words / seconds * 60);
    $('.stats').html('<h2>Words: <b>' + words + '</b> (+' + words*5 + ' pts) | WPM: <b>' + wpm + '</b> (x' + (wpm / 40).toFixed(1) + ' bonus)</p></h2>');
}

updateFlowState = function() {
    if (! flowing) {
        sv_time = getTime();
        hideEncouragement();
        flowing = true;
    }
    if (saveFlowTimeout) {
        window.clearTimeout(saveFlowTimeout);
    }
    
    updateFlowStatus();

    saveFlowTimeout = window.setTimeout(saveFlow, 1000);
}

function getTime() {
    return (new Date).getTime();
}

function getElapsedSeconds() {
    return (getTime() - sv_time) / 1000;
}

document.getElementById("playingfield").oninput = updateFlowState;

//function bind(sc, f) {
//    Mousetrap.bind(sc, function(e) {
//        if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
//        f();
//        status();
//    });
//}
//
//bind('ctrl+h', function() { left(); });
//bind('ctrl+l', function() { right(); });
//bind('ctrl+h', function() { left(); });
//bind('ctrl+l', function() { right(); });

//bind('alt+left', function() { left(); });
//bind('alt+right', function() { right(); });
//bind('alt+up', function() { commit(); });
//bind('alt+down', function() { scratch(); });

//bind('ctrl+s', function() { commit(); });
//bind('ctrl+space', function() { scratch(); });
