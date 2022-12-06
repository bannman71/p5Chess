function chooseTimeControl(time,increment){
    blackTime = new Timer(time, increment);
    whiteTime = new Timer(time, increment);
}


function test(){
    console.log(blackTime);
}


export default class Timer{

    constructor(time, increment){ //time in minutes
        this.time = time * 60;
        this.increment = increment;
        this.timeMinuteDisplayed;
        this.timeSecondDisplayed;
    }

    update(timeTaken){
        this.time -= timeTaken;
        this.time.addIncrement();
        this.timeMinuteDisplayed = Math.floor(this.time / 60);
        this.timeSecondDisplayed = this.time % 60;
    }   

    addIncrement(){
        this.time += this.increment;
    }
    

}
