function chooseTimeControl(time,increment){
    blackTime = new Timer(time, increment);
    whiteTime = new Timer(time, increment);
}


function test(){
    console.log(blackTime);
}


export default class Timer{

    constructor(time, increment){
        this.time = time;
        this.increment = increment;
    }

    update(start, delta){
        
    }   

    addIncrement(){
        this.time += this.increment;
    }
    

}
