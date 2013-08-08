// Game state vars
var saveFlowTimeout = null;
var wordcount = 0;
var score = 0;
var sv_time = 0;
var flowing = false;

// Game mode vars
var game_started = false;
var game_start_time = null;
var game_mode = null;
var timer_goal = null;
var wordcount_goal = null;
var kittens_mode = null;
var final_game_length = null;
var kitten_gifs = null;
var kitten_count = 0;

// Stats collection vars
var longest_flow = -1;

// ============================== Game Start ==================================
function startGame() {
    game_mode = $('#tekst-mode').val();
    wordcount_goal = parseInt($('#tekst-wordcount').val());
    // seconds
    timer_goal = 60 * parseInt($('#tekst-timer').val());
    kittens_mode = $('#tekst-kittens').val();

    // call Giphy at the start of the round
    if (kittens_mode) {
        callGiphy();
    }
    game_start_time = getTime();
    game_started = true;
    window.setInterval(updateFlowStatus, 100);
}

// ============================= Game Logic ===================================
function startNewFlow() {
    sv_time = getTime();
    hideEncouragement();
    flowing = true;
}

updateFlowState = function() {
    if (! game_started) {
        startGame();
    }
    if (! flowing) {
        startNewFlow();
    }
    if (saveFlowTimeout) {
        window.clearTimeout(saveFlowTimeout);
    }
    
    updateFlowStatus();

    saveFlowTimeout = window.setTimeout(saveFlow, 500);
}

function saveFlow() {
    var text = $('#playingfield').val();
    var words = getWordCount(text);
    var flow_time = getElapsedSeconds(sv_time);

    freezeFlowAndReset(text);

    wordcount += words;
    current_score = getScore(text, flow_time)[1];
    score += current_score;

    if (words > longest_flow) { longest_flow = words; }

    updateFlowStatus();
    //displayEncouragement(current_score);
    hideEncouragement();

    if(kittens_mode) { displayKitten(); }
    if (checkEndGame()) { endGame(); }

    flowing = false;
}

// =========================== Game End =======================================
function checkEndGame() {
    if (game_mode == "wordcount" && wordcount >= wordcount_goal) {
        return true;
    } 
    if (game_mode == "timer" && getElapsedSeconds(game_start_time) >= timer_goal) {
        return true;
    }
    return false;
}

function endGame() {
    final_game_length = getElapsedSeconds(game_start_time);
    hideEncouragement();
    disablePlayingField();
    enableSaveButton();
    $('#game-over').addClass('white-stroke');
    $('#game-over').css('display', 'block');
    $('.end-game').css('display', 'block');
    $('#title').css('display', 'block');
}

function saveFlowToServer() {
    $('.flow-save').css('display', 'block');
    saveFlow();
    var total_text = $('.text-content').text();
    var title = $('#title').val();
    $.post('/flow', { text: total_text, score: score, mode: game_mode, timer: final_game_length, wordcount: wordcount, title: title, longest_flow: longest_flow }, function(data) {
        setTimeout(function() {
            l = window.location;
            window.location.replace(l.protocol + "//" + l.host + data);
        }, 800);
    });
}

// ============================== Display helpers =============================
function freezeFlowAndReset(text) {
    $('.tekstflyt').before("<div class='text-content'><p>" + text + "\n" + "</p></div>");
    $('#playingfield').val("");
    scroll();
}

function displayEncouragement(score) {
    if (flowing) {
        var ret_val = getEncouragementLevel(score);
        var word = ret_val[0];
        var bonus = ret_val[1];
        $('.encouragement').html("<h2>" + word + " flow! (+ " + bonus + " pts)</h2>");
        $('.encouragement').css("display", "block");
    }
}

function hideEncouragement() {
    $('.encouragement').css("display", "none");
}

updateFlowStatus = function() {
    var text = $('#playingfield').val();
    var words = getWordCount(text);
    var seconds = getElapsedSeconds(sv_time);
    var wpm = Math.round(words / seconds * 60);
    $('.stats').html('<h2>Words: <b>' + words + '</b> (+' + words*5 + ' pts) | WPM: <b>' + wpm + '</b> (x' + (wpm / 40).toFixed(1) + ' bonus)</p></h2>');
    var this_score = getScore(text, seconds);
    displayEncouragement(this_score[0]);

    scoreBoardUpdate(wordcount, words, this_score[1]);
}

function scoreBoardUpdate(wordcount, words, this_score) {
    var total_wordcount = wordcount + words;
    var total_score = score + this_score;
    if (game_mode == "wordcount") {
        countdown = "| Words left: <b>" + (wordcount_goal - total_wordcount) + "</b>"
    }
    if (game_mode == "timer") {
        countdown = "| Secs left: <b>" + (timer_goal - getElapsedSeconds(game_start_time)).toFixed(1) + "</b>"
    }
    $('#scoreboard').html("<h2>Words: <b>" + total_wordcount + "</b> | Score: <b>" + total_score + "</b> " + countdown + "</h2>");
}

function disablePlayingField() {
    $('#playingfield').css('display', 'none').attr('disabled','disabled');
}

function enableSaveButton() {
    $('.btn-save').css('display', 'block');
    $('.btn-save').on('click', function() {
        saveFlowToServer();
    });
}

function scroll() {
    $('html,body').animate({
        scrollTop: $(".tekstflyt").offset().top - $('.navbar').height()},
        'slow');
}

// ============================== Helpers =====================================

function getEncouragementLevel(score) {
    var word = "poor";
    var bonus = 0;
    if (score > 50) { word = "okay"; bonus = 25; }
    if (score > 100) { word = "fair"; bonus = 50; }
    if (score > 200) { word = "cool"; bonus = 100; }
    if (score > 400) { word = "nice"; bonus = 150; }
    if (score > 600) { word = "sweet"; bonus = 200; }
    if (score > 900) { word = "great"; bonus = 300; }
    if (score > 1500) { word = "awesome"; bonus = 400; }
    if (score > 2000) { word = "amazing"; bonus = 500; }
    if (score > 2700) { word = "incredible"; bonus = 600; }
    if (score > 3500) { word = "spectacular"; bonus = 800; }
    if (score > 4500) { word = "unbelievable"; bonus = 1000; }
    if (score > 6000) { word = "extraordinary"; bonus = 1200; }
    return [word, bonus];
}

function getTime() {
    return (new Date).getTime();
}

function getElapsedSeconds(time) {
    return (getTime() - time) / 1000;
}

document.getElementById("playingfield").oninput = updateFlowState;

// scores should be higher the longer the text is
// scores should be higher the longer the time is
// scores should be higher the higher the ratio of text to time is
function getScore(text, time) {
    var words = getWordCount(text);
    var wpm = (words / time) * 60;
    var score = Math.round(words*5*wpm/40);

    ret_val = getEncouragementLevel(score);

    return [score, score + ret_val[1]];
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

// =========================== Kitten Mode ====================================
function displayKitten() {
    var caturl = kitten_gifs[kitten_count]['images']['fixed_height'].url;
    if (kitten_count < kitten_gifs.length){
        kitten_count++;
    }

    $('p').addClass('kitten-p');
    $('.encouragement').addClass('white-stroke');
    $('.stats').addClass('white-stroke');
    $('#scoreboard').addClass('white-stroke');
    $('footer').addClass('white-stroke');
    $('body').css('background', 'url("' + caturl + '")');
}

function hideKitten() {
    $('body').css('background', 'url("/assets/images/debut_light.png")');

}

// currently only pulls 50 gifs.
function callGiphy() {
    var xhr = $.get("http://api.giphy.com/v1/gifs/search?q=kittens&api_key=dc6zaTOxFJmzC&limit=50");
    xhr.done(function(data) { 
        console.log("success got data", data.data); 
        kitten_gifs = data.data;
    });
}
