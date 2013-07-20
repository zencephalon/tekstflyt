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
    var flow_score = Math.round(words * flow_time / 1000);

    $('.tekstflyt').before("<div><p>" + text + "</p></div>");
    $('#playingfield').val("");

    wordcount += words;
    score += flow_score;

    $('#scoreboard').html("Words: <b>" + wordcount + "</b> - Score: <b>" + score + "</b>");

    updateFlowStatus();
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
    if (! flowing) {
        sv_time = getTime();
        flowing = true;
    }
    if (saveFlowTimeout) {
        window.clearTimeout(saveFlowTimeout);
    }
    var text = $('#playingfield').val();
    var chars = text.length;
    var words = getWordCount(text);
    $('.stats').html('<p>chars: <b>' + chars + '</b></p><p>words: <b>' + words + '</b></p>');
    saveFlowTimeout = window.setTimeout(saveFlow, 1000);
}

function getTime() {
    return (new Date).getTime();
}

document.getElementById("playingfield").onkeyup = updateFlowStatus;

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
