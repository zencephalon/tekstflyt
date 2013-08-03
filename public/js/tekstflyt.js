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
    current_score = getScore(text, flow_time);
    score += current_score;

    scoreBoardUpdate(wordcount, score);

    updateFlowStatus();
    displayEncouragement(current_score);

    flowing = false;
}

function displayEncouragement(score) {
    var word;
    word = "pathetic";
    if (score > 50) { word = "okay"; }
    if (score > 100) { word = "cool"; }
    if (score > 200) { word = "nice"; }
    if (score > 300) { word = "sweet"; }
    if (score > 400) { word = "great"; }
    if (score > 600) { word = "awesome"; }
    if (score > 800) { word = "amazing"; }
    if (score > 1000) { word = "incredible"; }
    if (score > 1400) { word = "spectacular"; }
    if (score > 1800) { word = "unbelievable"; }
    if (score > 2200) { word = "extraordinary"; }
    $('.encouragement').html("<h2>" + word + " flow!</h2>");
    $('.encouragement').css("display", "block");
}

function hideEncouragement() {
    $('.encouragement').css("display", "none");
}

function freezeFlowAndReset(text) {
    $('.tekstflyt').before("<div class='text-content'><p>" + text + "\n" + "</p></div>");
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

function saveFlowToServer() {
    saveFlow();
    var total_text = $('.text-content').text();
    $.post('/flow', { text: total_text, score: score });
}

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
