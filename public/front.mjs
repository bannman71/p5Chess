class Coords{
    static x;
    static y;    
}

export default class Front {

    constructor(p5, spacing, blockSize, pieceScale, images){ 
        this.p5 = p5;
        
        this.black = 'rgb(140,162,173)';
        this.white = 'rgb(222,237,230)';
        

        this.spacing = spacing;
        this.blockSize = blockSize;
        this.pieceScale = pieceScale;
        this.images = images;

    }
 

    getMouseCoord(x,y){
        Coords.x = Math.floor(x / this.blockSize);
        Coords.y = Math.floor(y / this.blockSize);

        return Coords;
    }

    getPieceAtMousepos(isWhite, occSquares,x,y){
        x = Math.floor(x / this.blockSize);
        y = Math.floor(y / this.blockSize);
        var offset = 7; 
        if (isWhite) offset = 0;
        if ((x < 8 && x >= 0) && (y < 8 && y >= 0))  return occSquares[Math.abs(offset - y)][Math.abs(offset - x)];
        return undefined;
    }    

    drawPieceAtMousepos(piece, x, y){

        x -= this.blockSize * this.pieceScale / 2;  // centers piece
        y -= this.blockSize * this.pieceScale / 2;

        if (piece !== 0){
            
            let pieceNumber = piece.colourAndPiece();

            this.p5.image(this.images[pieceNumber], 
            Math.min(this.p5.width - this.blockSize + this.spacing, Math.max(this.spacing, x)), 
            Math.min(this.p5.height - this.blockSize + this.spacing, Math.max(this.spacing, y)), this.blockSize * this.pieceScale, this.blockSize * this.pieceScale);
        }
    }

    drawPiece(piece,coordX,coordY){
        coordX = this.spacing + coordX * this.blockSize;
        coordY = this.spacing + coordY * this.blockSize;

        this.p5.image(this.images[piece],coordX,coordY, this.blockSize * this.pieceScale, this.blockSize * this.pieceScale);
        
    }

    drawGrid(){
        for(let y = 0; y < 8; y++ ){
            for(let x = 0; x < 4; x++){
                this.p5.fill(this.black);
                this.p5.noStroke();
                this.p5.square((x*2 + ((y+1) % 2)) * this.blockSize, y * this.blockSize, this.blockSize);
            } 
        }
    }

    drawAllPieces(isWhite, occSquares, pieceAtMouse){
        var offset = 7;
        if (isWhite) offset = 0;
        let row;
        let col;

        console.log(offset);

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                row = Math.abs(offset - i); //7 - 0
                col = Math.abs(offset - j);
                if (occSquares[row][col] !== 0){
                    if (pieceAtMouse !== occSquares[i][j]) this.drawPiece(occSquares[i][j].colourAndPiece(), col, row);
                }
            }
        }
        
    }

    drawLegalSquares(squares){
        let row;
        let col;

        for (let i = 0; i < squares.length; i++){
            row = (this.blockSize / 2) + squares[i][0] * this.blockSize;
            col =  (this.blockSize/2) + squares[i][1] * this.blockSize;
            this.p5.fill(80,123,101, 175);
            this.p5.ellipse(col,row,this.blockSize * 0.25);
        }
        
    }

}