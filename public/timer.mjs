export default class Timer{

    constructor(isWhite, time, increment){ //time in minutes
        this.time = time * 60;
        this.increment = increment;
        this.isWhite = isWhite;
        this.timeMinuteDisplayed;
        this.timeSecondDisplayed;
    }

    update(timeTaken){
        console.log(timeTaken + ' TimeTaken');
        this.time -= timeTaken;
        this.time += this.increment;
        this.timeMinuteDisplayed = Math.floor(this.time / 60);
        this.timeSecondDisplayed = this.time % 60;
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
            //place the timer containers in the correct place
            blackTimerCSS = showTop;
            $('#black-timer-container').css(blackTimerCSS);
            timerDistFromTop = $('#black-timer-container').height() + boardSize + (boardSize *0);
            showBottom.top = ('%dpx', timerDistFromTop);
            whiteTimerCSS = showBottom;
        }else {
            whiteTimerCSS = showTop;
            $('#white-timer-container').css(whiteTimerCSS);
            
            timerDistFromTop = $('#white-timer-container').height() + boardSize + (boardSize *0);
            showBottom.top = ('%dpx', timerDistFromTop);
            blackTimerCSS = showBottom;

        }

        $('#black-timer-container').css(blackTimerCSS);
        $('#white-timer-container').css(whiteTimerCSS);

    }
    
    displayTime(){
        if (this.isWhite){
            let whiteTimer = document.getElementById('white-timer');
            let whiteTimerHTML = `
                <h4>hello</h4>
            `;
            whiteTimer.innerHTML = whiteTimerHTML;
        }
    }

}