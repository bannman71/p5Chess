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

    show(clientIsWhite){
        //get id for both black and white timers
        //update html for their positions based on what side client is
        //css to make it look nice

        // if (clientIsWhite){
        let blackTimerCSS = {
            'position': 'absolute',
            'top': '0px',
            'width': '25%',
            'height': '7%',
            'background-color': 'white',
            'border-style': 'dashed'
        };


        $('#black-timer-container').css(blackTimerCSS);



        // }
    }
    
}