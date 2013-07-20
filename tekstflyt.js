// saved buffer

var saveFlowTimeout = null;

function saveFlow() {
    var text = $('#playingfield').val();
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

function Buffer(text, cursor) {
    this.text = text; this.cursor = cursor;
}

Buffer.prototype.set = function() {
    deft = illusion();
    deft.value = this.text;
    setCaret(deft, this.cursor);
}

Buffer.prototype.toString = function() {
    return this.cursor + ":" + this.text;
}

function getBuffer() {
    deft = illusion();
    return new Buffer(deft.value.replace(/ +/g, ' '), getCaret(deft));
}

function commit() {
    sbuffer = getBuffer();
    buffers = [sbuffer];
    current = 0;
    commits++;
}

function save() {
    buffer = getBuffer();
    buffers[current] = buffer;
}

function scratch() {
    save();
    current = buffers.length;
    switch_illusion();
    $('#next').trigger('click');
    buffers.push(sbuffer);
    sbuffer.set();
}

function right() {
    if (buffers.length > 1) {
        save();
        current = (current + 1) % buffers.length;
        switch_illusion();
        $('#next').trigger('click');
        buffers[current].set();
    }
}

function left() {
    if (buffers.length > 1) {
        save();
        current = current == 0 ? (buffers.length - 1) : current - 1;
        switch_illusion();
        $('#prev').trigger('click');
        buffers[current].set();
    }
}

function status() {
    var html = "Draft: <b>" + (current + 1) + "</b>" + "/" + buffers.length;
    html += " - Commit: <b>" + commits + "</b>"
    document.getElementById("buffers").innerHTML = html;
}

function bind(sc, f) {
    Mousetrap.bind(sc, function(e) {
        if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
        f();
        status();
    });
}

//bind('ctrl+h', function() { left(); });
bind('ctrl+l', function() { right(); });
bind('ctrl+h', function() { left(); });
//bind('ctrl+l', function() { right(); });

//bind('alt+left', function() { left(); });
//bind('alt+right', function() { right(); });
//bind('alt+up', function() { commit(); });
//bind('alt+down', function() { scratch(); });

bind('ctrl+s', function() { commit(); });
bind('ctrl+space', function() { scratch(); });
