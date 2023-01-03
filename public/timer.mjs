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

    addIncrement(){
        this.time += this.increment;
    }

    showContainer(boardSize){
        let timerDistFromTop;
        let showTop = { //display the timer at top of the board
            'position': 'absolute',
            'top': '0px',
            'width': '25%',
            'height': '6%',
            'background-color': 'white',
            'border-style': 'none'
        }; 
        let showBottom = { //display timer at the bottom of the board
            'position': 'absolute',
            'top': 'ToBeDecided',
            'width': '25%',
            'height': '6%',
            'background-color': 'white',
            'border-style': 'none'
        };

        let blackTimerCSS;
        let whiteTimerCSS;

        if (this.clientIsWhite){
            //set black css
            blackTimerCSS = showTop;
            $('#black-timer-container').css(blackTimerCSS);

            //calculate how far from top white's timer must be
            timerDistFromTop = $('#black-timer-container').height() + boardSize;
            showBottom.top = ('%dpx', timerDistFromTop);
            whiteTimerCSS = showBottom;
        }else {
            //set white css
            whiteTimerCSS = showTop;
            $('#white-timer-container').css(whiteTimerCSS);

            //calculate how far from top black's timer must be
            timerDistFromTop = $('#white-timer-container').height() + boardSize;
            showBottom.top = ('%dpx', timerDistFromTop);
            blackTimerCSS = showBottom;

        }

        $('#black-timer-container').css(blackTimerCSS);
        $('#white-timer-container').css(whiteTimerCSS);

    }

    toTimeFormatMMSS(){
        var timeMinutesDisplayed = Math.trunc(this.timeToDisplay / 60);
        var timeSecondsDisplayed = Math.trunc(this.timeToDisplay) % 60;

        if (timeMinutesDisplayed < 10) timeMinutesDisplayed = "0"+timeMinutesDisplayed;
        if (timeSecondsDisplayed < 10) timeSecondsDisplayed = "0"+timeSecondsDisplayed; 

        return timeMinutesDisplayed+':'+timeSecondsDisplayed;
    }

    displayTime(){
        let colour;
        if (this.isWhiteTimer) {colour = "white"} 
        else {colour = "black"}

        let Timer = document.getElementById(`${colour}-timer`);
        Timer.innerHTML = `
            <h4>${this.toTimeFormatMMSS()}</h4>
        `;
    }

}

export class ServerTimer{

    constructor(time, increment){
        this.time = time * 60;
        this.increment = increment;
    }

    update(timeTaken){
        console.log(timeTaken + ' TimeTaken');
        this.time -= timeTaken;
        this.time += this.increment;
    }

}
