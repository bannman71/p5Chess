export default class GameRoom{

    constructor(roomCode, board, whiteTimer, blackTimer, PGN, client){
        this.roomCode = roomCode;
        this.board = board;
        this.whiteTimer = whiteTimer;
        this.blackTimer = blackTimer;
        this.PGN = PGN;
        this.client = client;
    }

}