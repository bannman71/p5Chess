export default class Timer{

    constructor(isWhite, time, increment){ //time in minutes
        this.time = time * 60;
        this.increment = increment;
        this.isWhite = isWhite;
        this.timeDisplayed;
    }

    update(timeTaken){
        console.log(timeTaken + ' TimeTaken');
        this.time -= timeTaken;
        this.time += this.increment;
        this.timeMinutesDisplayed;
        this.timeSecondsDisplayed;
    }   

    addIncrement(){
        this.time += this.increment;
    }

    showContainer(boardSize){
        let timerDistFromTop;
        let showTop = {
            'position': 'absolute',
            'top': '0px',
            'width': '25%',
            'height': '6%',
            'background-color': 'white',
            'border-style': 'none'
        }; 
        let showBottom = {
            'position': 'absolute',
            'top': 'ToBeDecided',
            'width': '25%',
            'height': '6%',
            'background-color': 'white',
            'border-style': 'none'
        };

        let blackTimerCSS;
        let whiteTimerCSS;

        if (this.isWhite){
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
        this.timeMinutesDisplayed = Math.floor(this.time / 60);
        this.timeSecondsDisplayed = this.time % 60;

        if (this.timeMinutesDisplayed < 10) this.timeMinutesDisplayed = "0"+this.timeMinutesDisplayed;
        if (this.timeSecondsDisplayed < 10) this.timeSecondsDisplayed = "0"+this.timeSecondsDisplayed; 

        return this.timeMinutesDisplayed+':'+this.timeSecondsDisplayed;
    }

    displayTime(){
        if (this.isWhite){
            let whiteTimer = document.getElementById('white-timer');
            let whiteTimerHTML = `
                <h4>${this.toTimeFormatMMSS()}</h4>
            `;
            whiteTimer.innerHTML = whiteTimerHTML;
        }
    }

}