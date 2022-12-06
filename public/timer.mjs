export default class Timer{

    constructor(time, increment){ //time in minutes
        this.time = time * 60;
        this.increment = increment;
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

    showContainer(clientIsWhite, boardSize){
        //get id for both black and white timers
        //update html for their positions based on what side client is
        //css to make it look nice
        let timerDistFromTop = (boardSize * 0.06) + boardSize + (boardSize * 0.01);
        let showTop = {
            'position': 'absolute',
            'top': '0px',
            'width': '25%',
            'height': '6%',
            'background-color': 'white',
            'border-style': 'dashed'
        }; 

        let showBottom = {
            'position': 'absolute',
            'top': ('%dpx', timerDistFromTop),
            'width': '25%',
            'height': '6%',
            'background-color': 'white',
            'border-style': 'dashed'
        };
        let blackTimerCSS;
        let whiteTimerCSS;
        if (clientIsWhite){
            //place the timer containers in the correct place
            blackTimerCSS = showTop;
            whiteTimerCSS = showBottom;
        }else {
            blackTimerCSS = showBottom;
            whiteTimerCSS = showTop;
        }

        $('#black-timer-container').css(blackTimerCSS);
        $('#white-timer-container').css(whiteTimerCSS);

    }
    
}