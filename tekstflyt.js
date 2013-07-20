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
    var flowing = false;
    var flow_time = getTime() - sv_time;
    //var flow_score = Math.round(words * flow_time / 1000);

    $('.tekstflyt').before("<div class='text-content'><p>" + text + "</p></div>");
    $('#playingfield').val("");

    wordcount += words;
    score += getScore(text, flow_time);

    $('#scoreboard').html("<h2>Words: <b>" + wordcount + "</b> | Score: <b>" + score + "</b><h2>");

    updateFlowStatus();
    $("html, body").animate({ scrollTop: $(document).height() }, "slow");
}

// scores should be higher the longer the text is
// scores should be higher the longer the time is
// scores should be higher the higher the ratio of text to time is
function getScore(text, time) {
    var chars = text.length;
    var words = getWordCount(text);
    var seconds = time / 1000;
    var wpm = (words / seconds) * 60;
    var score = words*5 + Math.round(chars * seconds * Math.pow(wpm / 40, 40 / wpm) / 10);
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
    $('.stats').html('<h2><p>Chars: <b>' + chars + '</b></p><p>Words: <b>' + words + '</b></p></h2>');
}

updateFlowState = function() {
    if (! flowing) {
        sv_time = getTime();
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

document.getElementById("playingfield").onkeyup = updateFlowState;

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
