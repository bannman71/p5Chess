export default class ClientTimer{

    constructor(clientIsWhite, isWhiteTimer, time, increment){ //time in minutes
        this.clientIsWhite = clientIsWhite;
        this.time = time * 60;
        this.increment = increment;
        this.isWhiteTimer = isWhiteTimer;
        this.timeToDisplay = time * 60;
    }

    update(timeTaken){
        console.log(timeTaken + ' TimeTaken');
        this.time -= timeTaken;
        this.time += this.increment;
    }   

    clientSideTimerUpdate(){
        this.timeToDisplay -= 0.1;
    }

    showContainer(boardSize){
        let timerDistFromTop;
        let showTop = { //display the timer at top of the board
            'position': 'absolute',
            'top': '0px',
            'width': '135px',
            'height': '40px',
            'background-color': 'white',
            'border-style': 'none'
        }; 
        let showBottom = { //display timer at the bottom of the board
            'position': 'absolute',
            'top': 'ToBeDecided', //is changed via jquery
            'width': '135px',
            'height': '40px',
            'background-color': 'white',
            'border-style': 'none'
        };

        let blackTimerCSS;
        let whiteTimerCSS;

        if (this.clientIsWhite){
            //set black css
            blackTimerCSS = showTop;
            $('#black-timer').css(blackTimerCSS);

            //calculate how far from top white's timer must be
            timerDistFromTop = $('#black-timer').height() + boardSize;
            showBottom.top = ('%dpx', timerDistFromTop);
            whiteTimerCSS = showBottom;
        }else {
            //set white css
            whiteTimerCSS = showTop;
            $('#white-timer').css(whiteTimerCSS);

            //calculate how far from top black's timer must be
            timerDistFromTop = $('#white-timer').height() + boardSize;
            showBottom.top = ('%dpx', timerDistFromTop);
            blackTimerCSS = showBottom;

        }

        $('#black-timer').css(blackTimerCSS);
        $('#white-timer').css(whiteTimerCSS);

    }

    toTimeFormatMMSS(){
        var timeMinutesDisplayed = Math.trunc(this.timeToDisplay / 60);
        var timeSecondsDisplayed = Math.trunc(this.timeToDisplay) % 60;

        if (timeMinutesDisplayed < 10) timeMinutesDisplayed = "0"+timeMinutesDisplayed;
        if (timeSecondsDisplayed < 10) timeSecondsDisplayed = "0"+timeSecondsDisplayed; 

        return timeMinutesDisplayed+':'+timeSecondsDisplayed;
    }

    displayTime() {
        let colour;
        if (this.isWhiteTimer) {
            colour = "white"
        } else {
            colour = "black"
        }

        let Timer = document.getElementById(`${colour}-timer`);
        let tempID = `${colour}-timer-text`;
        let tempContainer = `${colour}-timer-container`;
        Timer.innerHTML = `
            <div class="timer-container" id="${tempContainer}">
                <p id="${tempID}" class="timer-content">${this.toTimeFormatMMSS()}</p>
            </div>
        `;

    }

}

export class ServerTimer{

    constructor(time, increment){
        this.time = time * 60;
        this.increment = increment;
    }

    update(timeTaken){
        this.time -= timeTaken;
        this.time += this.increment;
    }

}
