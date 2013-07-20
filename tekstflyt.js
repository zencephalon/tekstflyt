// saved buffer

var saveFlowTimeout = null;

function saveFlow() {
    var text = $('#playingfield').val();
    var chars = text.length;
    var words = getWordCount(text);

    $('.tekstflyt').before("<div><p>" + text + "</p></div>");
    $('#playingfield').val("");


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
    if (saveFlowTimeout) {
        window.clearTimeout(saveFlowTimeout);
    }
    var text = $('#playingfield').val();
    var chars = text.length;
    var words = getWordCount(text);
    $('.stats').html('<p>chars: <b>' + chars + '</b></p><p>words: <b>' + words + '</b></p>');
    saveFlowTimeout = window.setTimeout(saveFlow, 1000);
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
